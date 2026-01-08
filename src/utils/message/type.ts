/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 一組可供 webview 調用的擴展主機服務
 */
type Service = {
  [id: string]: (params: any) => Promise<any> | any;
};

/**
 * webview 希望調用擴展主機的服務時所發送的消息結構
 */
type InvokeMessage = {
  type: "1ureka.invoke";
  requestId: string;
  serviceId: string;
  params: any;
};

/**
 * 擴展主機回應 webview 調用請求時所發送的消息結構
 */
type InvokeResponseMessage = {
  type: "1ureka.invoke.response";
  requestId: string;
  serviceId: string;
  result: any;
};

export type { Service, InvokeMessage, InvokeResponseMessage };
