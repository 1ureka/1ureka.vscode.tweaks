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
 * 向擴展發送消息
 */
function postMessageToExtension(message: any) {
  vscode.postMessage(message);
}

export { postMessageToExtension, getInitialData };
