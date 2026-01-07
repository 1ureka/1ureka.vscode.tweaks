import * as vscode from "vscode";
import { generateReactHtml } from "@/utils/vscode/webview-html";
import { randomUUID } from "crypto";
import type { OneOf } from "@/utils/shared/type";
import type { WebviewId } from "@/contribute";

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
