/* eslint-disable @typescript-eslint/no-explicit-any */

import * as vscode from "vscode";
import type { InvokeMessage } from "@/utils/message_client";

/**
 * 一組可供 webview 調用的擴展主機處理函式型別定義
 */
type API = {
  [id: string]: (params: any) => Promise<any> | any;
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
 * 註冊多個處理函式來處理來自 webview 的調用請求
 */
function registerInvokeEvents(panel: vscode.WebviewPanel, handlers: API) {
  const disposable = panel.webview.onDidReceiveMessage(async (message) => {
    const { type, requestId, handlerId, params } = message as InvokeMessage;

    if (type === "1ureka.invoke" && handlerId in handlers) {
      const result = await handlers[handlerId](params);
      const responseMessage: InvokeResponseMessage = { type: "1ureka.invoke.response", requestId, handlerId, result };

      panel.webview.postMessage(responseMessage);
    }
  });

  panel.onDidDispose(() => disposable.dispose());
}

export { registerInvokeEvents };
export type { API, InvokeResponseMessage };
