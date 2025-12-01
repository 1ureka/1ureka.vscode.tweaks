/* eslint-disable @typescript-eslint/no-explicit-any */

import * as vscode from "vscode";
import type { InvokeMessage } from "@/utils/message_client";

/**
 * 假設一個任意的處理函式，其環境可以是擴展主機也可以是 webview 前端
 */
type API = {
  id: string;
  handler: (params: any) => any | Promise<any>;
};

/**
 * 擴展主機回應 webview 調用請求時所發送的消息結構
 */
type InvokeResponseMessage = {
  type: "1ureka.invoke.response";
  requestId: string;
  handlerId: string;
  result: any;
};

/**
 * 處理來自前端的調用請求，並使用指定的處理函式回應結果
 * @example
 * // 假設在擴展主機中有一個處理函式
 * async function myHandler(params: { id: string }): Promise<{ name: string; age: number }>
 * type MyAPI = { id: "myHandler"; handler: typeof myHandler };
 *
 * // 那麼可以這樣設置消息處理
 * onDidReceiveInvoke<MyAPI>(panel, "myHandler", myHandler);
 *
 * // 這時前端可以調用
 * const result = await invoke<typeof myHandler>({ id: "123" });
 * // result 的類型會自動推斷為 { name: string; age: number }
 */
function onDidReceiveInvoke<T extends API = never>(panel: vscode.WebviewPanel, id: T["id"], handler: T["handler"]) {
  const disposable = panel.webview.onDidReceiveMessage(async (message) => {
    const { type, requestId, handlerId, params } = message as InvokeMessage;

    if (type === "1ureka.invoke" && handlerId === id) {
      const result = await handler(params);
      const responseMessage: InvokeResponseMessage = {
        type: "1ureka.invoke.response",
        requestId,
        handlerId: id,
        result,
      };

      panel.webview.postMessage(responseMessage);
    }
  });

  panel.onDidDispose(() => disposable.dispose());
}

/**
 * 擴展主機想調用 webview 的某個處理函式或是想讓 webview 調用某個擴展主機處理函式時所發送的消息結構
 */
type ForwardCommandMessage = {
  type: "1ureka.command";
  action: string;
};

/**
 * 將來自擴展主機的 command 訊息轉發到指定的 webview 面板
 * @example
 * // 比如在 webview/context (右鍵選單) 有一個 command 叫做 "resetView"
 * // 而前端有一個處理函式叫做 handleResetView
 * const handleResetView = () => { ... };
 * type ResetViewAPI = { id: "resetView"; handler: typeof handleResetView };
 *
 * // 那麼在擴展主機中可以這樣轉發 command 訊息到前端
 * forwardCommandToWebview<ResetViewAPI>(panel, "resetView");
 *
 * // 又或者是 webview/context 有一個 command 叫做 "openFile"，但由於後端是無狀態的，因此透過轉發
 * // 假設後端有一個處理函式叫做 handleOpenFile
 * const handleOpenFile = (params: { filePath: string }) => { ... };
 * type OpenFileAPI = { id: "openFile"; handler: typeof handleOpenFile };
 *
 * // 那麼在擴展主機中可以這樣轉發 command 訊息到前端
 * forwardCommandToWebview<OpenFileAPI>(panel, "openFile");
 *
 * // 前端需要註冊監聽來處理這些 command 訊息
 * onReceiveCommand<ResetViewAPI>("resetView", handleResetView);
 * onReceiveCommand<OpenFileAPI>("openFile", () => invoke<OpenFileAPI>("openFile", { filePath: store.getState() }));
 */
function forwardCommandToWebview<T extends API = never>(panel: vscode.WebviewPanel, action: T["id"]) {
  const message: ForwardCommandMessage = { type: "1ureka.command", action };
  panel.webview.postMessage(message);
}

export { onDidReceiveInvoke, forwardCommandToWebview };
export type { API, InvokeResponseMessage, ForwardCommandMessage };
