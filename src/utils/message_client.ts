import { defer, type Promised } from "@/utils";
import type { API, InvokeResponseMessage, ForwardCommandMessage } from "@/utils/message_host";

/**
 * 獲取初始數據（從 HTML 中的 script 標籤提取）
 */
function getInitialData<T = any>(): T | null {
  const el = document.getElementById("__data__");
  if (!el || !el.textContent) {
    return null;
  }

  try {
    return JSON.parse(el.textContent);
  } catch (e) {
    console.error("Failed to parse initial data:", e);
    return null;
  }
}

/**
 * 從模組層確保單例化 VS Code API
 */
const vscode = acquireVsCodeApi();

/**
 * webview 希望調用擴展主機的處理函式時所發送的消息結構
 */
type InvokeMessage = {
  type: "1ureka.invoke";
  requestId: string;
  handlerId: string;
  params: any;
};

/**
 * 調用擴展主機處理函式並獲取結果，使用時須導入由擴展主機定義的處理函式型別就能讓前後端型別自動對齊
 * @example
 * // 假設在擴展主機中有一個處理函式
 * async function myHandler(params: { id: string }): Promise<{ name: string; age: number }>
 * type MyAPI = { id: "myHandler"; handler: typeof myHandler };
 *
 * // 那麼在前端調用時可以這樣寫
 * import type { MyAPI } from "path/to/extension/host/api"; // 注意要加 type 關鍵字，因為前端無法使用實際的擴展主機代碼
 * const resultInWebview = await invoke<MyAPI>("myHandler", { id: "123" });
 * // resultInWebview 的類型會自動推斷為 { name: string; age: number }
 */
function invoke<T extends API>(id: T["id"], params: Parameters<T["handler"]>[0]): Promised<T["handler"]> {
  const { promise, resolve } = defer<Awaited<ReturnType<T["handler"]>>>();
  const requestId = crypto.randomUUID();

  const message: InvokeMessage = { type: "1ureka.invoke", requestId, handlerId: id, params };
  vscode.postMessage(message);

  const handleMessage = (event: MessageEvent<InvokeResponseMessage>) => {
    const message = event.data;
    if (message.type === "1ureka.invoke.response" && message.requestId === requestId && message.handlerId === id) {
      window.removeEventListener("message", handleMessage);
      resolve(message.result);
    }
  };

  window.addEventListener("message", handleMessage);
  return promise;
}

/**
 * 處理來自擴展主機的命令消息
 * 詳情請參考 src/utils/message_host.ts 中的 forwardCommandMessage 相關說明
 */
function onReceiveCommand<T extends API>(
  id: T["id"],
  handler: (params: Parameters<T["handler"]>[0]) => void,
  getParams: () => Parameters<T["handler"]>[0]
) {
  const handleMessage = (event: MessageEvent<ForwardCommandMessage>) => {
    const message = event.data;
    if (message.type === "1ureka.command" && message.action === id) {
      handler(getParams());
    }
  };

  window.addEventListener("message", handleMessage);
}

export { getInitialData, invoke, onReceiveCommand };
export type { InvokeMessage };
