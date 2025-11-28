import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { randomUUID, type UUID } from "crypto";

import { tryCatch } from "../utils/tryCatch";
import { createWebviewPanel } from "../utils/webviewHelper";
import { handleFileSystemData } from "../handlers/fileSystemHandlers";
import type { FileSystemData, FileSystemDataParams } from "../handlers/fileSystemHandlers";
import type { OneOf } from "../utils/type";

import fileSystemLight from "../icons/file-system-light.svg";
import fileSystemDark from "../icons/file-system-dark.svg";

// ---------------------------------------------
// 前端往後端傳送的訊息相關型別與檢查
// ---------------------------------------------

type OpenInTarget = "workspace" | "terminal" | "imageWall";

/** 用於換資料夾、換頁的請求 */
type FileSystemRequest = { type: "request" } & FileSystemDataParams;
/** 用於讓前端可以呼叫 showInformationMessage 的訊息 */
type FileSystemInfoMessage = { type: "info"; message: string };
/** 用於讓前端呼叫開啟檔案的訊息 */
type FileSystemOpenFileMessage = { type: "openFile"; filePath: string };
/** 用於讓前端呼叫所有需要用到 dialog 的訊息 (比如建立新檔案、建立新資料夾)
 * (雖然架構的確是後端決定狀態，但後端仍是無狀態的，實際儲存在前端，因此該請求必須包含上次的狀態) */
type FileSystemDialogMessage = { type: "openDialog"; dialogType: "newFile" | "newFolder" } & FileSystemDataParams;
/** 用於讓前端呼叫 "在此開啟..." 等功能 */
type FileSystemOpenInMessage = { type: "openIn"; openType: OpenInTarget } & FileSystemDataParams;

/** 該延伸主機可以接受的所有訊息種類 */
type FileSystemMessage = OneOf<
  [
    FileSystemInfoMessage,
    FileSystemRequest,
    FileSystemOpenFileMessage,
    FileSystemDialogMessage,
    FileSystemOpenInMessage
  ]
>;

/** 檢查一個物件是否包含 handleFileSystemData 所需的參數 */
function isFileSystemDataParams(value: Record<string, unknown>): value is FileSystemDataParams {
  const check1 = typeof value.panelId === "string" && typeof value.folderPath === "string";
  const check2 = typeof value.sortField === "string" && typeof value.sortOrder === "string";
  const check3 = typeof value.page === "number" && typeof value.filter === "string";
  return check1 && check2 && check3;
}

/** 檢查接收到的訊息格式是否正確 */
function checkMessage(value: unknown): value is FileSystemMessage {
  if (typeof value !== "object" || value === null) return false;

  const msg = value as Record<string, unknown>;

  if (msg.type === "info") {
    return typeof msg.message === "string";
  }
  if (msg.type === "request") {
    return isFileSystemDataParams(msg);
  }
  if (msg.type === "openFile") {
    return typeof msg.filePath === "string";
  }
  if (msg.type === "openDialog") {
    return (msg.dialogType === "newFile" || msg.dialogType === "newFolder") && isFileSystemDataParams(msg);
  }
  if (msg.type === "openIn") {
    return (
      (msg.openType === "workspace" || msg.openType === "terminal" || msg.openType === "imageWall") &&
      isFileSystemDataParams(msg)
    );
  }

  return false;
}

// ---------------------------------------------
// 與 vscode 介面交互並協調 handler 相關的邏輯
// ---------------------------------------------

/**
 * 建立檔案系統檢視面板，用 SSR 方式注入第一頁資料
 */
const createFileSystemPanel = async (context: vscode.ExtensionContext, folderPath: string) => {
  const panelId = randomUUID();

  const initialParams = {
    panelId,
    folderPath,
    page: 1,
    sortField: "fileName" as const,
    sortOrder: "asc" as const,
    filter: "all" as const,
  };

  const initialData = await handleFileSystemData(initialParams);

  const panel = createWebviewPanel<FileSystemData>({
    panelId: "1ureka.fileSystem", // 這與 panelId 無關，只是註冊用的識別字串，實際溝通會使用 initialData.panelId
    panelTitle: "檔案系統",
    webviewType: "fileSystem",
    extensionUri: context.extensionUri,
    resourceUri: vscode.Uri.file(folderPath),
    initialData,
    iconPath: { light: vscode.Uri.parse(fileSystemLight), dark: vscode.Uri.parse(fileSystemDark) },
  });

  return { panelId, panel };
};

/**
 * 重新呼叫 handleFileSystemData 並更新前端狀態
 */
const updateState = async (webview: vscode.Webview, params: FileSystemDataParams) => {
  try {
    const data = await handleFileSystemData(params);
    webview.postMessage({ type: "fileSystemData", data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知錯誤";
    vscode.window.showErrorMessage(`無法載入檔案系統資料: ${message}`);
  }
};

/**
 * 處理並回應檔案系統面板的請求
 */
const dispatchEvent = async (panelId: UUID, event: FileSystemMessage, webview: vscode.Webview) => {
  if (event.type === "info") {
    vscode.window.showInformationMessage(event.message);
    return;
  }

  if (event.type === "openFile") {
    const uri = vscode.Uri.file(event.filePath);
    vscode.commands.executeCommand("vscode.open", uri, vscode.ViewColumn.Active);
    return;
  }

  if (event.panelId !== panelId) return; // 剩下的請求都需要比對 panelId

  if (event.type === "request") {
    await updateState(webview, { ...event });
    return;
  }

  if (event.type === "openDialog" && event.dialogType === "newFile") {
    // 先試試看 EAFP 原則
    const fileName = await vscode.window.showInputBox({ prompt: "輸入新檔案名稱", placeHolder: "檔案名稱" });
    if (!fileName) return;

    const newFilePath = path.join(event.folderPath, fileName);

    const { error } = await tryCatch(() => fs.promises.writeFile(newFilePath, ""));
    if (error) {
      vscode.window.showErrorMessage(`無法建立新檔案: ${error instanceof Error ? error.message : "未知錯誤"}`);
      return;
    }

    const uri = vscode.Uri.file(newFilePath);
    vscode.commands.executeCommand("vscode.open", uri);

    await updateState(webview, { ...event });
    return;
  }

  if (event.type === "openDialog" && event.dialogType === "newFolder") {
    const folderName = await vscode.window.showInputBox({ prompt: "輸入新資料夾名稱", placeHolder: "資料夾名稱" });
    if (!folderName) return;

    const { error } = await tryCatch(() => fs.promises.mkdir(path.join(event.folderPath, folderName)));
    if (error) {
      vscode.window.showErrorMessage(`無法建立新資料夾: ${error instanceof Error ? error.message : "未知錯誤"}`);
      return;
    }

    await updateState(webview, { ...event });
    return;
  }

  if (event.type === "openIn") {
    if (event.openType === "workspace") {
      const uri = vscode.Uri.file(event.folderPath);
      vscode.commands.executeCommand("vscode.openFolder", uri, true);
      return;
    }
    if (event.openType === "terminal") {
      const terminal = vscode.window.createTerminal({ cwd: event.folderPath });
      terminal.show();
      return;
    }
    if (event.openType === "imageWall") {
      vscode.commands.executeCommand("1ureka.imageWall.openImageWallFromFolder", event.folderPath);
      return;
    }
  }
};

/**
 * 創建並開啟檔案系統瀏覽器面板
 */
async function openFileSystemPanel(context: vscode.ExtensionContext, folderPath: string) {
  const { panelId, panel } = await createFileSystemPanel(context, folderPath);

  const messageListener = panel.webview.onDidReceiveMessage(async (event) => {
    if (checkMessage(event)) await dispatchEvent(panelId, event, panel.webview);
  });

  panel.onDidDispose(() => messageListener.dispose());
  context.subscriptions.push(panel);
  return panel;
}

export { openFileSystemPanel };
export type { FileSystemRequest, FileSystemDialogMessage, FileSystemOpenInMessage };
