import * as vscode from "vscode";
import { randomUUID, type UUID } from "crypto";

import { createWebviewPanel } from "@/utils/webviewHelper";
import { handleInitialData, handleShowInformationMessage } from "@/handlers/fileSystemHandlers";
import { handleReadDirectory, handleOpenFile, handleOpenInTarget } from "@/handlers/fileSystemHandlers";
import { handleCreateFile, handleCreateDir } from "@/handlers/fileSystemHandlers";
import type { Prettify } from "@/utils/type";

import fileSystemLight from "@/icons/file-system-light.svg";
import fileSystemDark from "@/icons/file-system-dark.svg";

// ---------------------------------------------
// 前端往後端雙方的訊息相關型別
// ---------------------------------------------

type FileSystemAPI = {
  showInformationMessage: typeof handleShowInformationMessage;
  readDirectory: typeof handleReadDirectory;
  createFile: typeof handleCreateFile;
  createDir: typeof handleCreateDir;
  openFile: typeof handleOpenFile;
  openInTarget: typeof handleOpenInTarget;
};

/** 由延伸主機來規定前端在通訊時，應怎樣實作其 postMessage 函數 */
interface RequestFileSystemInFrontend {
  <K extends keyof FileSystemAPI>(params: {
    panelId: UUID;
    type: K;
    params: Prettify<Parameters<FileSystemAPI[K]>[0]>;
  }): Promise<Awaited<ReturnType<FileSystemAPI[K]>>>;
}

/** 由延伸主機在一開始就注入到 html 的資料 */
type FileSystemInitialData = Prettify<{ panelId: UUID } & Awaited<ReturnType<typeof handleReadDirectory>>>;

export type { RequestFileSystemInFrontend as RequestFileSystemHost, FileSystemInitialData };

// ---------------------------------------------
// 與 vscode 介面交互並協調 handler 相關的邏輯
// ---------------------------------------------

/**
 * 建立檔案系統檢視面板，用 SSR 方式注入第一頁資料
 */
const createFileSystemPanel = async (context: vscode.ExtensionContext, dirPath: string) => {
  const panelId = randomUUID();

  const initialData = { panelId, ...handleInitialData({ dirPath }) };

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

/**
 * 檔案系統相關 API 映射
 */
const fileSystemAPI: FileSystemAPI = {
  showInformationMessage: handleShowInformationMessage,
  readDirectory: handleReadDirectory,
  createFile: handleCreateFile,
  createDir: handleCreateDir,
  openFile: handleOpenFile,
  openInTarget: handleOpenInTarget,
};

/**
 * 處理並回應檔案系統面板的請求
 */
const dispatchEvent = async (
  panelId: UUID,
  webview: vscode.Webview,
  event: { panelId: UUID; requestId?: string; type: keyof FileSystemAPI; params: any }
) => {
  if (event.panelId !== panelId) return;
  const apiFunction = fileSystemAPI[event.type];
  const result = await apiFunction(event.params);
  webview.postMessage({ panelId, requestId: event.requestId, type: event.type + "Result", result });
};

/**
 * 創建並開啟檔案系統瀏覽器面板
 */
async function openFileSystemPanel(context: vscode.ExtensionContext, dirPath: string) {
  const { panelId, panel } = await createFileSystemPanel(context, dirPath);

  const messageListener = panel.webview.onDidReceiveMessage((event) => {
    dispatchEvent(panelId, panel.webview, event);
  });

  panel.onDidDispose(() => messageListener.dispose());
  context.subscriptions.push(panel);
  return panel;
}

export { openFileSystemPanel };
