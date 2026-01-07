/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 一組可供 webview 調用的擴展主機處理函式型別定義
 */
type API = {
  [id: string]: (params: any) => Promise<any> | any;
};

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
 * 擴展主機回應 webview 調用請求時所發送的消息結構
 */
type InvokeResponseMessage = {
  type: "1ureka.invoke.response";
  requestId: string;
  handlerId: string;
  result: any;
};

export type { API, InvokeMessage, InvokeResponseMessage };
