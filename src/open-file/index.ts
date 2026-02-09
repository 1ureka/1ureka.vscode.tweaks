import * as vscode from "vscode";
import type { ExtensionFeature } from "@/vscode";
import { createCommandManager } from "@/vscode/command";
import { openWithDefaultApp } from "@/utils/system";

/**
 * 啟動通用調整功能，註冊外部應用程式相關命令
 */
function activate(context: vscode.ExtensionContext) {
  const commandManager = createCommandManager(context);

  commandManager.register("1ureka.vscode.openWithSystemDefaultApp", (uri: vscode.Uri) => {
    if (!uri) return;

    openWithDefaultApp({
      filePath: uri.fsPath,
      askForConfirmation: async (message: string) => {
        const result = await vscode.window.showWarningMessage(message, { modal: true }, "是", "否");
        return result === "是";
      },
      showError: (message: string) => {
        vscode.window.showErrorMessage(message);
      },
    });
  });
}

/**
 * 通用調整功能模組
 */
const feature: ExtensionFeature = {
  activate,
};

export default feature;
