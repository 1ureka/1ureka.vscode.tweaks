import * as vscode from "vscode";
import { randomUUID } from "crypto";

import { createWebviewPanel } from "@/utils/webview";
import { handleInitialData, handleShowInformationMessage } from "@/handlers/fileSystemHandlers";
import { handleReadDirectory, handleOpenFile, handleOpenInTarget } from "@/handlers/fileSystemHandlers";
import { handleCreateFile, handleCreateDir } from "@/handlers/fileSystemHandlers";

import fileSystemLight from "@/assets/file-system-light.svg";
import fileSystemDark from "@/assets/file-system-dark.svg";
import { onDidReceiveInvoke } from "@/utils/message_host";

/** 由延伸主機在一開始就注入到 html 的資料 */
type FileSystemInitialData = Awaited<ReturnType<typeof handleReadDirectory>>;

/**
 * 建立檔案系統檢視面板，用 SSR 方式注入第一頁資料
 */
const createFileSystemPanel = async (context: vscode.ExtensionContext, dirPath: string) => {
  const panelId = randomUUID();

  const initialData = handleInitialData({ dirPath });

  const panel = createWebviewPanel<FileSystemInitialData>({
    panelId: "1ureka.fileSystem", // 這與 panelId 無關，只是註冊用的識別字串，實際溝通會使用 initialData.panelId
    panelTitle: "檔案系統",
    webviewType: "fileSystem",
    extensionUri: context.extensionUri,
    resourceUri: vscode.Uri.file(dirPath),
    initialData,
    iconPath: { light: vscode.Uri.parse(fileSystemLight), dark: vscode.Uri.parse(fileSystemDark) },
  });

  return { panelId, panel };
};

type ShowInfoAPI = { id: "showInformationMessage"; handler: typeof handleShowInformationMessage };
type ReadDirAPI = { id: "readDirectory"; handler: typeof handleReadDirectory };
type CreateFileAPI = { id: "createFile"; handler: typeof handleCreateFile };
type CreateDirAPI = { id: "createDir"; handler: typeof handleCreateDir };
type OpenFileAPI = { id: "openFile"; handler: typeof handleOpenFile };
type OpenInTargetAPI = { id: "openInTarget"; handler: typeof handleOpenInTarget };

/**
 * 創建並開啟檔案系統瀏覽器面板
 */
async function openFileSystemPanel(context: vscode.ExtensionContext, dirPath: string) {
  const { panelId, panel } = await createFileSystemPanel(context, dirPath);

  onDidReceiveInvoke<ShowInfoAPI>(panel, "showInformationMessage", handleShowInformationMessage);
  onDidReceiveInvoke<ReadDirAPI>(panel, "readDirectory", handleReadDirectory);
  onDidReceiveInvoke<CreateFileAPI>(panel, "createFile", handleCreateFile);
  onDidReceiveInvoke<CreateDirAPI>(panel, "createDir", handleCreateDir);
  onDidReceiveInvoke<OpenFileAPI>(panel, "openFile", handleOpenFile);
  onDidReceiveInvoke<OpenInTargetAPI>(panel, "openInTarget", handleOpenInTarget);

  context.subscriptions.push(panel);
  return { panelId, panel };
}

export { openFileSystemPanel };
export type { FileSystemInitialData };
export type { ShowInfoAPI, ReadDirAPI, CreateFileAPI, CreateDirAPI, OpenFileAPI, OpenInTargetAPI };
