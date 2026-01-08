import * as vscode from "vscode";

import { registerInvokeEvents } from "@/utils/message/host";
import { createWebviewPanel } from "@/utils/vscode/webview";
import { handleInitialData, type ReadResourceResult } from "@/feature-explorer/handlers";
import { explorerService } from "@/feature-explorer/service";

import explorerIconLight from "@/assets/explorer-light.svg";
import explorerIconDark from "@/assets/explorer-dark.svg";

/**
 * ?
 */
class ExplorerWebviewPanelProvider {
  /**
   * 擴展的上下文，用於存取資源
   */
  private readonly context: vscode.ExtensionContext;

  /**
   * 根據上下文為擴展建立一個系統瀏覽器自訂編輯器提供者
   */
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * 開啟一個新的 explorer 面板，需指定目標路徑
   */
  createPanel(dirPath: string) {
    const panel = createWebviewPanel<ReadResourceResult>({
      context: this.context,
      panelId: "1ureka.explorer",
      panelTitle: "系統瀏覽器",
      jsBundleName: "explorer",
      jsInitialData: handleInitialData({ dirPath }),
      panelIcon: { light: vscode.Uri.parse(explorerIconLight), dark: vscode.Uri.parse(explorerIconDark) },
    });

    registerInvokeEvents(panel, explorerService);
  }
}

export { ExplorerWebviewPanelProvider };
