import * as vscode from "vscode";
import type { ExtensionFeature } from "@/utils/vscode";
import { createCommandManager } from "@/utils/vscode/command";
import { openWithDefaultApp } from "@/utils/host/system";

/**
 * 註冊使用系統預設應用程式開啟檔案的指令事件
 */
function registerExternalAppCommands(context: vscode.ExtensionContext) {
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
 * 啟動通用調整功能，註冊外部應用程式相關命令
 */
function activate(context: vscode.ExtensionContext) {
  registerExternalAppCommands(context);
}

/**
 * 通用調整功能模組
 */
const feature: ExtensionFeature = {
  activate,
};

export default feature;
