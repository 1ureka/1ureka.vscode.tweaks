/* eslint-disable @typescript-eslint/no-explicit-any */

import { defer } from "@/utils/shared";
import type { Promised } from "@/utils/shared/type";
import type { Service, InvokeMessage, InvokeResponseMessage } from "@/utils/message/type";

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
 * 建立一個用於調用擴展主機服務的介面
 * @param options 可選的設定參數，例如超時時間
 * @returns 包含 invoke 和 close 方法的物件
 */
function createInvoke<T extends Service>() {
  /**
   * 使用 Map 管理 pending 中的請求，key 是 requestId
   */
  const pendingRequests = new Map<string, { resolve: (value: any) => void }>();

  /**
   * 監聽來自擴展主機的回應消息
   */
  const handleMessage = (event: MessageEvent<InvokeResponseMessage>) => {
    const message = event.data;
    if (message.type !== "1ureka.invoke.response") return;

    const request = pendingRequests.get(message.requestId);
    if (request) {
      request.resolve(message.result);
      pendingRequests.delete(message.requestId);
    }
  };

  /**
   * 調用擴展主機的處理函式
   * @param id 處理函式的識別碼
   * @param params 傳遞給處理函式的參數
   */
  function invoke<ID extends keyof T & string>(serviceId: ID, params: Parameters<T[ID]>[0]): Promised<T[ID]> {
    const { promise, resolve } = defer<Awaited<ReturnType<T[ID]>>>();

    const requestId = crypto.randomUUID();
    const message: InvokeMessage = { type: "1ureka.invoke", requestId, serviceId, params };

    pendingRequests.set(requestId, { resolve });
    vscode.postMessage(message);

    return promise;
  }

  window.addEventListener("message", handleMessage);

  return { invoke };
}

export { getInitialData, createInvoke };
