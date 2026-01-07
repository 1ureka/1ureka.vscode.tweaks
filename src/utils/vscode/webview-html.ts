import * as vscode from "vscode";
import webviewCSS from "@/assets/webview.css";

/**
 * 將資料序列化為適合插入 HTML 的字串
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeForHtml(data: any): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028") // Line separator
    .replace(/\u2029/g, "\\u2029"); // Paragraph separator
}

type generateReactHtmlParams = {
  webviewType: string;
  webview: vscode.Webview;
  extensionUri: vscode.Uri;
  initialData?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

/**
 * 生成 React WebView 的 HTML 模板
 */
function generateReactHtml({ webviewType, webview, extensionUri, initialData }: generateReactHtmlParams) {
  const webviewJS = vscode.Uri.joinPath(extensionUri, "dist", "webviews", `${webviewType}.js`);
  const jsWebviewUri = webview.asWebviewUri(webviewJS);
  const codiconsCss = vscode.Uri.joinPath(extensionUri, "node_modules", "@vscode/codicons", "dist", "codicon.css");
  const codiconsUri = webview.asWebviewUri(codiconsCss);

  const initialDataScript = initialData
    ? `<script id="__data__" type="application/json">${serializeForHtml(initialData)}</script>`
    : "";

  const nonce = getNonce();

  const csp = [
    "default-src 'none';",
    `img-src ${webview.cspSource} data:;`,
    `script-src 'nonce-${nonce}';`,
    `style-src ${webview.cspSource} https://fonts.googleapis.com 'unsafe-inline';`,
    `font-src ${webview.cspSource} https://fonts.gstatic.com;`,
  ];

  const htmlMeta = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">`;
  const htmlCSP = `<meta http-equiv="Content-Security-Policy" content="${csp.join(" ")}">`;
  const htmlCSS = `<style>${webviewCSS}</style>`;
  const htmlTitle = `<title>${webviewType}</title>`;
  const htmlCodicons = `<link href="${codiconsUri}" rel="stylesheet" />`;

  const htmlHead = `<head>${htmlMeta}${htmlCSP}${htmlCSS}${htmlTitle}${htmlCodicons}${initialDataScript}</head>`;
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

export { generateReactHtml };
