import * as vscode from "vscode";
import type { Service, InvokeMessage, InvokeResponseMessage } from "@/utils/message/type";

/**
 * 註冊多個處理函式來處理來自 webview 的調用請求
 */
function registerInvokeEvents(panel: vscode.WebviewPanel, service: Service) {
  const disposable = panel.webview.onDidReceiveMessage(async (message) => {
    const { type, requestId, serviceId, params } = message as InvokeMessage;

    if (type === "1ureka.invoke" && serviceId in service) {
      const result = await service[serviceId](params);
      const responseMessage: InvokeResponseMessage = { type: "1ureka.invoke.response", requestId, serviceId, result };

      panel.webview.postMessage(responseMessage);
    }
  });

  panel.onDidDispose(() => disposable.dispose());
}

export { registerInvokeEvents };
