/* eslint-disable @typescript-eslint/no-explicit-any */

import { defer } from "@/utils";
import type { Promised } from "@/utils/type";
import type { API, APILegacy, InvokeResponseMessage, ForwardCommandMessage } from "@/utils/message_host";

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
 * 建立一個用於調用擴展主機處理函式的介面
 * @param options 可選的設定參數，例如超時時間
 * @returns 包含 invoke 和 close 方法的物件
 */
function createInvoke<T extends API>(options?: { timeoutMs?: number }) {
  /** 預設的超時時間 (毫秒) */
  const timeoutMs = options?.timeoutMs ?? 30000;

  /** 標記此介面是否已關閉 */
  let isClosed = false;

  /** 使用 Map 管理 pending 中的請求，key 是 requestId */
  const pendingRequests = new Map<string, { resolve: (value: any) => void; reject: (reason?: any) => void }>();

  /**
   * 監聽來自擴展主機的回應消息
   */
  const handleMessage = (event: MessageEvent<InvokeResponseMessage>) => {
    const message = event.data;

    if (message.type !== "1ureka.invoke.response") return;

    const request = pendingRequests.get(message.requestId);
    if (request) {
      request.resolve(message.result);
      pendingRequests.delete(message.requestId); // 處理完後移除
    }
  };

  /**
   * 當超時時，拒絕對應的請求
   */
  const handleTimeouts = (requestId: string) => {
    const request = pendingRequests.get(requestId);

    if (request) {
      request.reject(new Error("Request timed out."));
      pendingRequests.delete(requestId);
    }
  };

  /**
   * 調用擴展主機的處理函式
   * @param id 處理函式的識別碼
   * @param params 傳遞給處理函式的參數
   */
  function invoke<ID extends keyof T & string>(id: ID, params: Parameters<T[ID]>[0]): Promised<T[ID]> {
    if (isClosed) return Promise.reject(new Error("Invoke interface is closed."));

    const { promise, resolve, reject } = defer<Awaited<ReturnType<T[ID]>>>();

    const requestId = crypto.randomUUID();

    pendingRequests.set(requestId, { resolve, reject });
    setTimeout(() => handleTimeouts(requestId), timeoutMs);

    const message: InvokeMessage = { type: "1ureka.invoke", requestId, handlerId: id, params };
    vscode.postMessage(message);

    return promise;
  }

  /**
   * 關閉訊息監聽器並不再**引用**未完成的請求 (另一端的環境仍可能在處理，但目前的環境不再關心結果了)
   */
  function close() {
    isClosed = true;

    window.removeEventListener("message", handleMessage);

    pendingRequests.forEach(({ reject }) => {
      reject(new Error("Invoke interface is closed."));
    });

    pendingRequests.clear();
  }

  window.addEventListener("message", handleMessage);

  return { invoke, close };
}

/**
 * 調用擴展主機處理函式並獲取結果，使用時須導入由擴展主機定義的處理函式型別就能讓前後端型別自動對齊
 * @deprecated
 */
function invoke<T extends APILegacy = never>(id: T["id"], params: Parameters<T["handler"]>[0]): Promised<T["handler"]> {
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
function onReceiveCommand<T extends APILegacy = never>(id: T["id"], handler: () => void) {
  const handleMessage = (event: MessageEvent<ForwardCommandMessage>) => {
    const message = event.data;
    if (message.type === "1ureka.command" && message.action === id) {
      handler();
    }
  };

  window.addEventListener("message", handleMessage);
}

export { getInitialData, createInvoke, invoke, onReceiveCommand };
export type { InvokeMessage };
