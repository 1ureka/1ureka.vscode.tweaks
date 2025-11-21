/**
 * VS Code WebView API 的型別定義
 */
interface VscodeApi {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
}

declare function acquireVsCodeApi(): VscodeApi;

/**
 * 獲取 VS Code API（只能調用一次）
 */
let vscodeApi: VscodeApi | undefined;

export function getVscodeApi(): VscodeApi {
  if (!vscodeApi) {
    vscodeApi = acquireVsCodeApi();
  }
  return vscodeApi;
}

/**
 * 向 Extension 發送消息
 */
export function postMessage<T = any>(type: string, payload?: T): void {
  const api = getVscodeApi();
  api.postMessage({ type, payload });
}

/**
 * 監聽來自 Extension 的消息
 */
export function onMessage<T = any>(handler: (message: { type: string; payload?: T }) => void): () => void {
  const listener = (event: MessageEvent) => {
    const message = event.data;
    handler(message);
  };

  window.addEventListener("message", listener);

  // 返回清理函數
  return () => {
    window.removeEventListener("message", listener);
  };
}

/**
 * 保存狀態到 VS Code
 */
export function saveState(state: any): void {
  const api = getVscodeApi();
  api.setState(state);
}

/**
 * 從 VS Code 讀取狀態
 */
export function getState<T = any>(): T | undefined {
  const api = getVscodeApi();
  return api.getState();
}
