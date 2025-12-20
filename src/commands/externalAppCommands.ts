import * as vscode from "vscode";
import { openWithDefaultApp } from "@/utils/system";
import { createCommandManager } from "@/utils/command";

export function registerExternalAppCommands(context: vscode.ExtensionContext) {
  const commandManager = createCommandManager(context);

  commandManager.register("1ureka.external.openWithSystemDefaultApp", (uri: vscode.Uri) => {
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
