import * as vscode from "vscode";
import type { ExtensionFeature } from "@/utils/vscode";
import { createCommandManager } from "@/utils/vscode/command";
import { injectStyles, restoreAndReinjectStyles, restoreStyles } from "@/feature-styles/handlers";

/**
 * 提示使用者重新啟動 VSCode
 */
async function promptRestart(action: string) {
  const result = await vscode.window.showWarningMessage(`已成功${action}，請重新啟動 VSCode 以套用變更。`, "重新啟動");
  if (result === "重新啟動") {
    vscode.commands.executeCommand("workbench.action.reloadWindow");
  }
}

/**
 * ?
 */
function activate(context: vscode.ExtensionContext) {
  const commandManager = createCommandManager(context);

  commandManager.register("1ureka.vscode.injectStyles", () => {
    const { success, message } = injectStyles();

    if (success) {
      promptRestart("注入自訂樣式");
    } else {
      vscode.window.showErrorMessage(message);
    }
  });

  commandManager.register("1ureka.vscode.restoreStyles", () => {
    const { success, message } = restoreStyles();

    if (success) {
      promptRestart("還原至原始狀態");
    } else {
      vscode.window.showErrorMessage(message);
    }
  });

  commandManager.register("1ureka.vscode.reinjectStyles", () => {
    const { success, message } = restoreAndReinjectStyles();

    if (success) {
      promptRestart("還原並重新注入自訂樣式");
    } else {
      vscode.window.showErrorMessage(message);
    }
  });
}

/**
 * ?
 */
const feature: ExtensionFeature = {
  activate,
};

export default feature;
