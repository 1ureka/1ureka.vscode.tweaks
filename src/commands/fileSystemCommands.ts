import * as vscode from "vscode";
import { openFileSystemPanel, ReadDirAPI } from "@/providers/fileSystemProvider";
import { forwardCommandToWebview } from "@/utils/message_host";

/**
 * 註冊檔案系統面板的生命週期管理
 */
function registerPanelsLifecycle(context: vscode.ExtensionContext) {
  /** 用於追縱目前開啟的檔案系統面板 */
  const panelsMap = new Map<string, vscode.WebviewPanel>();

  /** 開啟面板，從檔案總管右鍵開啟 */
  const openFromExplorer = async (uri: vscode.Uri) => {
    if (!uri || !uri.fsPath) {
      vscode.window.showErrorMessage("請選擇一個資料夾來開啟檔案系統");
    } else {
      const { panelId, panel } = await openFileSystemPanel(context, uri.fsPath);
      panelsMap.set(panelId, panel);
      panel.onDidDispose(() => panelsMap.delete(panelId));
    }
  };

  /** 開啟面板，從命令選單面板開啟 */
  const openFromCommandPalette = async () => {
    const folders = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "選擇資料夾",
    });

    // 不須要顯示錯誤訊息，因為可能使用者只是取消選擇
    if (folders && folders.length > 0) {
      const { panelId, panel } = await openFileSystemPanel(context, folders[0].fsPath);
      panelsMap.set(panelId, panel);
      panel.onDidDispose(() => panelsMap.delete(panelId));
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

  return () => {
    for (const panel of panelsMap.values()) {
      if (panel.active) return panel;
    }
    return null;
  };
}

type GetActivePanel = ReturnType<typeof registerPanelsLifecycle>;

// -----------------------------------------------------------------------------

/**
 * 註冊檔案系統用於右鍵選單的命令
 */
const registerContextMenuCommands = (context: vscode.ExtensionContext, getActivePanel: GetActivePanel) => {
  const refreshFromContext = vscode.commands.registerCommand("1ureka.fileSystem.refresh", () => {
    const panel = getActivePanel();
    if (!panel) return;
    forwardCommandToWebview<ReadDirAPI>(panel, "readDirectory");
  });

  context.subscriptions.push(refreshFromContext);
};

// -----------------------------------------------------------------------------

export function registerFileSystemCommands(context: vscode.ExtensionContext) {
  const getActivePanel = registerPanelsLifecycle(context);
  registerContextMenuCommands(context, getActivePanel);
}
