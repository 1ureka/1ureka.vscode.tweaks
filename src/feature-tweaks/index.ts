import * as vscode from "vscode";
import type { ExtensionFeature } from "@/utils-vscode";
import { createCommandManager } from "@/utils-vscode/command";
import { openWithDefaultApp } from "@/utils/host/system";
import { openNavigationMenu } from "@/feature-tweaks/navigation";

/**
 * 註冊主導航相關命令事件
 */
function registerNavigationCommands(context: vscode.ExtensionContext) {
  const commandManager = createCommandManager(context);

  commandManager.register("1ureka.main.openNavigation", () => {
    openNavigationMenu();
  });
}

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
 * ?
 */
function activate(context: vscode.ExtensionContext) {
  registerExternalAppCommands(context);
  registerNavigationCommands(context);
}

/**
 * ?
 */
const feature: ExtensionFeature = {
  activate,
};

export default feature;
