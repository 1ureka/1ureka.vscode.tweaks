import * as vscode from "vscode";
import { openFileSystemPanel } from "../providers/fileSystemProvider";

export function registerFileSystemCommands(context: vscode.ExtensionContext) {
  // 從檔案總管右鍵開啟
  const openFromExplorer = (uri: vscode.Uri) => {
    if (!uri || !uri.fsPath) {
      vscode.window.showErrorMessage("請選擇一個資料夾來開啟檔案系統");
    } else {
      openFileSystemPanel(context, uri.fsPath);
    }
  };

  // 從命令面板開啟
  const openFromCommandPalette = async () => {
    const folders = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "選擇資料夾",
    });

    // 不須要顯示錯誤訊息，因為可能使用者只是取消選擇
    if (folders && folders.length > 0) {
      openFileSystemPanel(context, folders[0].fsPath);
    }
  };

  const openFromExplorerCommand = vscode.commands.registerCommand(
    "1ureka.openFileSystemFromExplorer",
    openFromExplorer
  );
  const openFromCommandPaletteCommand = vscode.commands.registerCommand(
    "1ureka.openFileSystem",
    openFromCommandPalette
  );

  context.subscriptions.push(openFromExplorerCommand, openFromCommandPaletteCommand);
}
