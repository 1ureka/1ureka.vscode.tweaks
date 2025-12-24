import * as vscode from "vscode";
import { openWithDefaultApp } from "@/utils/system";
import { createCommandManager } from "@/utils-vscode/command";
import { FileMetadataProvider } from "@/providers/fileMetadataProvider";
import { openNavigationMenu } from "@/providers/navigationProvider";
import { injectStyles, restoreStyles, restoreAndReinjectStyles } from "@/handlers/injectStylesHandlers";

/**
 * 提示使用者重新啟動 VSCode
 */
async function promptRestart(action: string) {
  const result = await vscode.window.showWarningMessage(`已成功${action}，請重新啟動 VSCode 以套用變更。`, "重新啟動");
  if (result === "重新啟動") {
    vscode.commands.executeCommand("workbench.action.reloadWindow");
  }
}

// ---------------------------------------------------------------------------------

/**
 * 註冊主導航相關命令事件
 */
export function registerNavigationCommands(context: vscode.ExtensionContext) {
  const commandManager = createCommandManager(context);

  commandManager.register("1ureka.main.openNavigation", () => {
    openNavigationMenu();
  });
}

/**
 * 註冊注入與還原樣式的命令事件
 */
export function registerInjectStylesCommands(context: vscode.ExtensionContext) {
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
 * 註冊在狀態欄顯示檔案屬性相關全域事件
 */
export function registerFileMetadataCommands(context: vscode.ExtensionContext) {
  const fileMetadataProvider = FileMetadataProvider(context);

  /**  監聽 tab 變化 (同一分割視窗內切換分頁) */
  const changeTabsListener = vscode.window.tabGroups.onDidChangeTabs(() => {
    fileMetadataProvider.updateFromActiveTab();
  });
  /**  監聽 tab group 變化 (不同分割視窗間切換) */
  const changeTabGroupsListener = vscode.window.tabGroups.onDidChangeTabGroups(() => {
    fileMetadataProvider.updateFromActiveTab();
  });

  context.subscriptions.push(changeTabsListener, changeTabGroupsListener);

  fileMetadataProvider.updateFromActiveTab(); // 初始更新
}

/**
 * 註冊使用系統預設應用程式開啟檔案的指令事件
 */
export function registerExternalAppCommands(context: vscode.ExtensionContext) {
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
