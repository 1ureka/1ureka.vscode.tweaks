import * as vscode from "vscode";

/**
 * 將資料序列化為適合插入 HTML 的字串
 */
function serializeForHtml(data: any): string {
  return JSON.stringify(data)
    .replace(/\\/g, "\\\\")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028") // Line separator
    .replace(/\u2029/g, "\\u2029"); // Paragraph separator
}

/**
 * 生成 React WebView 的 HTML 模板
 */
export function generateHtml(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  scriptName: string,
  title: string,
  initialData?: any
): string {
  const jsUri = vscode.Uri.joinPath(extensionUri, "dist", "webviews", scriptName);
  const jsWebviewUri = webview.asWebviewUri(jsUri);
  const cssUri = vscode.Uri.joinPath(extensionUri, "dist", "webviews", scriptName.replace(".js", ".css"));
  const cssWebviewUri = webview.asWebviewUri(cssUri);

  const initialDataScript = initialData
    ? `<script id="__data__" type="application/json">${serializeForHtml(initialData)}</script>`
    : "";

  const nonce = getNonce();
  const cspContent = `default-src 'none'; img-src ${webview.cspSource} https: data:; script-src 'nonce-${nonce}'; style-src ${webview.cspSource} 'unsafe-inline';`;

  const htmlMeta = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">`;
  const htmlCSP = `<meta http-equiv="Content-Security-Policy" content="${cspContent}">`;
  const htmlTitle = `<title>${title}</title>`;
  const htmlCSS = `<link rel="stylesheet" href="${cssWebviewUri}">`;

  const htmlHead = `<head>${htmlMeta}${htmlCSP}${htmlTitle}${htmlCSS}${initialDataScript}</head>`;
  const htmlBody = `<body><div id="root"></div><script nonce="${nonce}" src="${jsWebviewUri}"></script></body>`;

  return `<!DOCTYPE html><html lang="zh-TW">${htmlHead}${htmlBody}</html>`;
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
