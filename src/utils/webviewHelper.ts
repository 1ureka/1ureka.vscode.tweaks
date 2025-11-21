import * as vscode from "vscode";

/**
 * 生成 React WebView 的 HTML 模板
 */
export function getReactWebviewHtml(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  scriptName: string,
  title: string
): string {
  const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "dist", "webviews", scriptName));
  const cssUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "dist", "webviews", scriptName.replace(".js", ".css"))
  );

  // 使用 nonce 來提高安全性
  const nonce = getNonce();

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: data:; script-src 'nonce-${nonce}'; style-src ${webview.cspSource} 'unsafe-inline';">
  <title>${title}</title>
  <link rel="stylesheet" href="${cssUri}">
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

/**
 * 生成一個隨機的 nonce
 */
function getNonce(): string {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

/**
 * WebView 和 Extension 之間的消息傳遞類型
 */
interface WebviewMessage<T = any> {
  type: string;
  payload?: T;
}

/**
 * 設置 WebView 的消息處理器
 */
export function setupWebviewMessageHandler<T = any>(
  panel: vscode.WebviewPanel,
  handler: (message: WebviewMessage<T>) => void | Promise<void>
): vscode.Disposable {
  return panel.webview.onDidReceiveMessage(handler);
}

/**
 * 從 Extension 向 WebView 發送消息
 */
export function postMessageToWebview<T = any>(panel: vscode.WebviewPanel, message: WebviewMessage<T>): void {
  panel.webview.postMessage(message);
}
