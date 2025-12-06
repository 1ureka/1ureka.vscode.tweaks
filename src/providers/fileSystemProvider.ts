import * as vscode from "vscode";

import { createWebviewPanelManager } from "@/utils/webview";
import { handleInitialData, handleShowInformationMessage } from "@/handlers/fileSystemHandlers";
import { handleSetSystemClipboard, handleOpenPathInputBox } from "@/handlers/fileSystemHandlers";
import { handleReadDirectory, handleOpenFile, handleOpenInTarget } from "@/handlers/fileSystemHandlers";
import { handleCreateFile, handleCreateDir } from "@/handlers/fileSystemHandlers";
import { onDidReceiveInvoke } from "@/utils/message_host";

import fileSystemLight from "@/assets/file-system-light.svg";
import fileSystemDark from "@/assets/file-system-dark.svg";

// ---------------------------------------------------------------------------------
// 定義初始注入資料型別與延伸主機端所有可呼叫的處理器 API 型別
// ---------------------------------------------------------------------------------

type FileSystemInitialData = Awaited<ReturnType<typeof handleReadDirectory>>;
type ShowInfoAPI = { id: "showInformationMessage"; handler: typeof handleShowInformationMessage };
type SetSystemClipboardAPI = { id: "setSystemClipboard"; handler: typeof handleSetSystemClipboard };
type ReadDirAPI = { id: "readDirectory"; handler: typeof handleReadDirectory };
type CreateFileAPI = { id: "createFile"; handler: typeof handleCreateFile };
type CreateDirAPI = { id: "createDir"; handler: typeof handleCreateDir };
type OpenFileAPI = { id: "openFile"; handler: typeof handleOpenFile };
type OpenInTargetAPI = { id: "openInTarget"; handler: typeof handleOpenInTarget };
type OpenPathInputBoxAPI = { id: "openPathInputBox"; handler: typeof handleOpenPathInputBox };

/**
 * 提供系統瀏覽器面板的管理功能，包括創建和獲取當前面板
 */
function FileSystemPanelProvider(context: vscode.ExtensionContext) {
  const panelManager = createWebviewPanelManager(context);

  const createPanel = (dirPath: string) => {
    const initialData = handleInitialData({ dirPath });
    const panel = panelManager.create<FileSystemInitialData>({
      panelId: "1ureka.fileSystem",
      panelTitle: "系統瀏覽器",
      webviewType: "fileSystem",
      extensionUri: context.extensionUri,
      resourceUri: vscode.Uri.file(dirPath),
      initialData,
      iconPath: { light: vscode.Uri.parse(fileSystemLight), dark: vscode.Uri.parse(fileSystemDark) },
    });

    onDidReceiveInvoke<ShowInfoAPI>(panel, "showInformationMessage", handleShowInformationMessage);
    onDidReceiveInvoke<SetSystemClipboardAPI>(panel, "setSystemClipboard", handleSetSystemClipboard);
    onDidReceiveInvoke<ReadDirAPI>(panel, "readDirectory", handleReadDirectory);
    onDidReceiveInvoke<CreateFileAPI>(panel, "createFile", handleCreateFile);
    onDidReceiveInvoke<CreateDirAPI>(panel, "createDir", handleCreateDir);
    onDidReceiveInvoke<OpenFileAPI>(panel, "openFile", handleOpenFile);
    onDidReceiveInvoke<OpenInTargetAPI>(panel, "openInTarget", handleOpenInTarget);
    onDidReceiveInvoke<OpenPathInputBoxAPI>(panel, "openPathInputBox", handleOpenPathInputBox);
  };

  return { getCurrentPanel: panelManager.getCurrent, createPanel };
}

export { FileSystemPanelProvider };
export type { FileSystemInitialData };
export type { ShowInfoAPI, SetSystemClipboardAPI, ReadDirAPI, CreateFileAPI, CreateDirAPI };
export type { OpenFileAPI, OpenInTargetAPI, OpenPathInputBoxAPI };
