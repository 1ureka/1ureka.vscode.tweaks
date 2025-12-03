import * as vscode from "vscode";
import type { CreateFileAPI, CreateDirAPI, ReadDirAPI } from "@/providers/fileSystemProvider";
import { FileSystemPanelProvider } from "@/providers/fileSystemProvider";
import { forwardCommandToWebview } from "@/utils/message_host";
import { createCommandManager } from "@/utils/command";

/**
 * 註冊檔案系統相關命令與面板
 */
export function registerFileSystemCommands(context: vscode.ExtensionContext) {
  const fileSystemProvider = FileSystemPanelProvider(context);
  const commandManager = createCommandManager(context);

  /** 開啟面板，從檔案總管右鍵開啟 */
  commandManager.register("1ureka.openFileSystemFromExplorer", (uri: vscode.Uri) => {
    if (!uri || !uri.fsPath) {
      vscode.window.showErrorMessage("請選擇一個資料夾來開啟檔案系統");
    } else {
      fileSystemProvider.createPanel(uri.fsPath);
    }
  });

  /** 開啟面板，從命令選單面板開啟 */
  commandManager.register("1ureka.openFileSystem", async () => {
    const folders = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "選擇資料夾",
    });

    // 不須要顯示錯誤訊息，因為可能使用者只是取消選擇
    if (folders && folders.length > 0) {
      fileSystemProvider.createPanel(folders[0].fsPath);
    }
  });

  commandManager.register("1ureka.fileSystem.refresh", () => {
    const panel = fileSystemProvider.getCurrentPanel();
    if (!panel) return;
    forwardCommandToWebview<ReadDirAPI>(panel, "readDirectory");
  });

  commandManager.register("1ureka.fileSystem.createFolder", () => {
    const panel = fileSystemProvider.getCurrentPanel();
    if (!panel) return;
    forwardCommandToWebview<CreateDirAPI>(panel, "createDir");
  });

  commandManager.register("1ureka.fileSystem.createFile", () => {
    const panel = fileSystemProvider.getCurrentPanel();
    if (!panel) return;
    forwardCommandToWebview<CreateFileAPI>(panel, "createFile");
  });
}
