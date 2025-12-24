import * as vscode from "vscode";
import { FileSystemPanelProvider } from "@/providers/fileSystemProvider";
import { createCommandManager } from "@/utils-vscode/command";

/**
 * 註冊系統瀏覽器相關命令與面板
 */
export function registerFileSystemCommands(context: vscode.ExtensionContext) {
  const fileSystemProvider = FileSystemPanelProvider(context);
  const commandManager = createCommandManager(context);

  commandManager.register("1ureka.explorer.openFromPath", async (params: vscode.Uri | string | undefined) => {
    if (params instanceof vscode.Uri) {
      fileSystemProvider.createPanel(params.fsPath);
    } else if (typeof params === "string") {
      fileSystemProvider.createPanel(params);
    } else {
      const { workspaceFolders } = vscode.workspace;
      if (workspaceFolders?.length) {
        fileSystemProvider.createPanel(workspaceFolders[0].uri.fsPath);
      } else {
        vscode.window.showErrorMessage("請提供資料夾路徑或先開啟一個工作區資料夾");
      }
    }
  });

  commandManager.register("1ureka.explorer.openFromDialog", async () => {
    const folders = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "選擇資料夾",
    });

    if (!folders || folders.length === 0) return;
    else fileSystemProvider.createPanel(folders[0].fsPath);
  });
}
