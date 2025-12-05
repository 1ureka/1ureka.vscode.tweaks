import * as vscode from "vscode";
import { randomUUID } from "crypto";
import type { OneOf } from "@/utils";
import type { WebviewId } from "@/contribute";

/**
 * 將資料序列化為適合插入 HTML 的字串
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeForHtml(data: any): string {
  return JSON.stringify(data)
    .replace(/\\/g, "\\\\")
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
  const cspContent = `default-src 'none'; img-src ${webview.cspSource} data:; script-src 'nonce-${nonce}'; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource};`;

  const htmlMeta = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">`;
  const htmlCSP = `<meta http-equiv="Content-Security-Policy" content="${cspContent}">`;
  const htmlTitle = `<title>${webviewType}</title>`;
  const htmlCodicons = `<link href="${codiconsUri}" rel="stylesheet" />`;

  const htmlHead = `<head>${htmlMeta}${htmlCSP}${htmlTitle}${htmlCodicons}${initialDataScript}</head>`;
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

/**
 * 建立或初始化 Webview Panel 的參數類型
 */
type CreateWebviewPanelParams<T> = {
  webviewType: string;
  extensionUri: vscode.Uri;
  resourceUri: vscode.Uri;
  initialData: T;
  iconPath?: { light: vscode.Uri; dark: vscode.Uri };
} & OneOf<[{ panelId: WebviewId; panelTitle: string }, { panel: vscode.WebviewPanel }]>;

/**
 * 建立一個新的 Webview Panel 或者根據 Editor 提供的 Panel 初始化 Webview Panel
 */
function createWebviewPanel<T>(params: CreateWebviewPanelParams<T>) {
  const { webviewType, extensionUri, resourceUri, initialData, iconPath } = params;

  let panel: vscode.WebviewPanel;
  const localResourceRoots = [extensionUri, resourceUri];

  if ("panel" in params) {
    panel = params.panel;
    panel.webview.options = { enableScripts: true, localResourceRoots };
  } else {
    const { panelId, panelTitle } = params;
    panel = vscode.window.createWebviewPanel(panelId, panelTitle, vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots,
    });
  }

  if (iconPath) panel.iconPath = iconPath;
  panel.webview.html = generateReactHtml({ webviewType, webview: panel.webview, extensionUri, initialData });
  return panel;
}

/**
 * 創建一個 Webview Panel 管理器，用於管理多個 Webview Panel 的生命週期
 */
function createWebviewPanelManager(context: vscode.ExtensionContext) {
  const panels = new Map<string, vscode.WebviewPanel>();

  /**
   * 創建一個新的 Webview Panel，會自動管理其生命週期
   */
  const create = <T>(params: CreateWebviewPanelParams<T>): vscode.WebviewPanel => {
    const panel = createWebviewPanel(params);
    const panelId = randomUUID();
    panels.set(panelId, panel);

    const disposeListener = panel.onDidDispose(() => {
      panels.delete(panelId);
      disposeListener.dispose();
    });

    context.subscriptions.push(panel, disposeListener);
    return panel;
  };

  /**
   * 獲取當前使用者正在互動的 Webview Panel
   */
  const getCurrent = (): vscode.WebviewPanel | null => {
    for (const panel of panels.values()) {
      if (panel.active) return panel;
    }
    return null;
  };

  return { create, getCurrent };
}

export { createWebviewPanelManager };
