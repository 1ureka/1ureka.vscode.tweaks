import * as vscode from "vscode";
import { createCommandManager } from "@/utils/command";
import { openNavigationMenu } from "@/providers/navigationProvider";

/**
 * 註冊導航相關命令與面板
 */
export function registerNavigationCommands(context: vscode.ExtensionContext) {
  const commandManager = createCommandManager(context);

  commandManager.register("1ureka.main.openNavigation", () => {
    openNavigationMenu();
  });
}
