import * as vscode from "vscode";
import { randomUUID } from "crypto";

import { createWebviewPanel } from "../utils/webviewHelper";
import { handleFileSystemData } from "../handlers/fileSystemHandlers";
import type { FileSystemData, FileSystemDataParams } from "../handlers/fileSystemHandlers";
import type { OneOf } from "../utils/type";

import fileSystemLight from "../icons/file-system-light.svg";
import fileSystemDark from "../icons/file-system-dark.svg";

/** 用於換資料夾、換頁的請求 */
type FileSystemRequest = { type: "request" } & FileSystemDataParams;

/** 該延伸主機可以接受的所有訊息種類 */
type FileSystemMessage = OneOf<
  [{ type: "info"; message: string }, FileSystemRequest, { type: "openFile"; filePath: string }]
>;

/** 檢查接收到的訊息格式是否正確 */
function checkMessage(value: unknown): value is FileSystemMessage {
  if (typeof value !== "object" || value === null) return false;

  const msg = value as Record<string, unknown>;

  if (msg.type === "info") {
    return typeof msg.message === "string";
  }

  if (msg.type === "request") {
    const check1 = typeof msg.panelId === "string" && typeof msg.folderPath === "string";
    const check2 = typeof msg.sortField === "string" && typeof msg.sortOrder === "string";
    const check3 = typeof msg.page === "number" && typeof msg.filter === "string";
    return check1 && check2 && check3;
  }

  if (msg.type === "openFile") {
    return typeof msg.filePath === "string";
  }

  return false;
}

/**
 * 首次建立並顯示檔案系統檢視面板，用 SSR 方式注入第一頁資料
 */
async function createFileSystemPanel(context: vscode.ExtensionContext, folderPath: string, page?: number) {
  const panelId = randomUUID();
  const initialParams = {
    panelId,
    folderPath,
    page: page ?? 1,
    sortField: "fileName" as const,
    sortOrder: "asc" as const,
    filter: "all" as const,
  };

  const initialData = await handleFileSystemData(initialParams);

  const panel = createWebviewPanel<FileSystemData>({
    panelId: "1ureka.fileSystem", // 這與 panelId 無關，只是註冊用的識別字串，實際溝通會使用 initialData.panelId
    panelTitle: "檔案系統瀏覽器",
    webviewType: "fileSystem",
    extensionUri: context.extensionUri,
    resourceUri: vscode.Uri.file(folderPath),
    initialData,
    iconPath: { light: vscode.Uri.parse(fileSystemLight), dark: vscode.Uri.parse(fileSystemDark) },
  });

  const webview = panel.webview;

  const messageListener = webview.onDidReceiveMessage(async (event) => {
    if (!checkMessage(event)) {
      console.warn("File System Extension Host: 接收到無效的訊息");
      return;
    }

    if (event.type === "info") {
      vscode.window.showInformationMessage(event.message);
      return;
    }

    if (event.type === "request" && event.panelId === panelId) {
      try {
        const data = await handleFileSystemData({ ...event });
        webview.postMessage({ type: "fileSystemData", data });
      } catch (error) {
        const message = error instanceof Error ? error.message : "未知錯誤";
        vscode.window.showErrorMessage(`無法載入檔案系統資料: ${message}`);
      }
      return;
    }

    if (event.type === "openFile") {
      const uri = vscode.Uri.file(event.filePath);
      vscode.commands.executeCommand("vscode.open", uri, vscode.ViewColumn.Active);
      return;
    }
  });

  panel.onDidDispose(() => messageListener.dispose());
  context.subscriptions.push(panel);
  return panel;
}

export { createFileSystemPanel };
export type { FileSystemRequest };
