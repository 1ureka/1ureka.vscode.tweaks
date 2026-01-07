import * as vscode from "vscode";
import type { API, InvokeMessage, InvokeResponseMessage } from "@/utils/message/type";

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
