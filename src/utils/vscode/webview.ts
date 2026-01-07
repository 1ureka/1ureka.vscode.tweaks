import * as vscode from "vscode";
import { generateReactHtml } from "@/utils/vscode/webview-html";
import type { OneOf } from "@/utils/shared/type";
import type { WebviewId } from "@/contribute";

/**
 * 建立或初始化 Webview Panel 的選項，其中
 * `js` 開頭的參數是用於用於配置 Webview 內 React 前端的載入與初始資料
 * `panel` 開頭的參數是用於用於配置 VS Code 原生 Webview 面板的屬性
 */
type WebviewPanelOptions<T> = {
  context: vscode.ExtensionContext;
  jsBundleName: string;
  jsInitialData: T;
  panelResources?: vscode.Uri[];
  panelIcon?: { light: vscode.Uri; dark: vscode.Uri };
} & OneOf<[{ panelId: WebviewId; panelTitle: string }, { panel: vscode.WebviewPanel }]>;

/**
 * 建立一個新的 Webview Panel 或者根據 Editor 提供的 Panel 初始化 Webview Panel，其中
 * `js` 開頭的參數是用於用於配置 Webview 內 React 前端的載入與初始資料
 * `panel` 開頭的參數是用於用於配置 VS Code 原生 Webview 面板的屬性
 */
function createWebviewPanel<T>(params: WebviewPanelOptions<T>) {
  const { context, jsBundleName, jsInitialData, panelResources, panelIcon } = params;

  let localResourceRoots = [context.extensionUri];

  if (panelResources && panelResources.length > 0) {
    localResourceRoots = localResourceRoots.concat(panelResources);
  }

  let panel: vscode.WebviewPanel | null = null;

  if ("panel" in params) {
    panel = params.panel;
    panel.webview.options = { enableScripts: true, localResourceRoots };
  }

  if ("panelId" in params) {
    const { panelId, panelTitle } = params;
    panel = vscode.window.createWebviewPanel(panelId, panelTitle, vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots,
    });
  }

  if (!panel) {
    throw new Error("參數錯誤：無法建立或初始化 Webview Panel。");
  }

  if (panelIcon) {
    panel.iconPath = panelIcon;
  }

  panel.webview.html = generateReactHtml({
    bundleName: jsBundleName,
    webview: panel.webview,
    extensionUri: context.extensionUri,
    initialData: jsInitialData,
  });

  context.subscriptions.push(panel);

  return panel;
}

export { createWebviewPanel };
