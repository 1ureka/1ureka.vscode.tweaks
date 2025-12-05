import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

import { tryCatch } from "@/utils";
import { readDirectory, inspectDirectory, isRootDirectory, pathToArray } from "@/utils/system";
import type { InspectDirectoryEntry } from "@/utils/system";

type ReadDirectoryResult = {
  // 有關當前目錄的資訊
  currentPath: string;
  currentPathParts: string[];
  isCurrentRoot: boolean;
  fileCount: number;
  folderCount: number;
  // 實際的檔案資料
  entries: InspectDirectoryEntry[];
  // 資料最後更新的時間戳記
  timestamp: number;
};

/**
 * 處理初始資料注入
 */
const handleInitialData = (params: { dirPath: string }): ReadDirectoryResult => {
  const currentPath = path.resolve(params.dirPath);
  return {
    currentPath,
    currentPathParts: pathToArray(currentPath),
    isCurrentRoot: isRootDirectory(currentPath),
    fileCount: 0,
    folderCount: 0,
    entries: [],
    timestamp: Date.now(),
  };
};

/**
 * 掃描資料夾內容，讀取檔案系統資訊並回傳
 */
const handleReadDirectory = async (params: { dirPath: string }): Promise<ReadDirectoryResult> => {
  const currentPath = path.resolve(params.dirPath);
  const currentPathParts = pathToArray(currentPath);
  const isCurrentRoot = isRootDirectory(currentPath);
  const entries = await readDirectory(currentPath);

  if (!entries) {
    return {
      currentPath,
      currentPathParts,
      isCurrentRoot,
      entries: [],
      fileCount: 0,
      folderCount: 0,
      timestamp: Date.now(),
    };
  }

  let folderCount = 0;
  let fileCount = 0;

  entries.forEach(({ fileType }) => {
    if (fileType === "folder") folderCount++;
    else if (fileType === "file") fileCount++;
  });

  const inspectedEntries = await inspectDirectory(entries);

  return {
    currentPath,
    currentPathParts,
    isCurrentRoot,
    entries: inspectedEntries,
    folderCount,
    fileCount,
    timestamp: Date.now(),
  };
};

/**
 * 在通知欄顯示資訊訊息
 */
const handleShowInformationMessage = async (params: { message: string }) => {
  vscode.window.showInformationMessage(params.message);
};

/**
 * 開啟指定的檔案
 */
const handleOpenFile = async (params: { filePath: string }) => {
  const uri = vscode.Uri.file(params.filePath);
  vscode.commands.executeCommand("vscode.open", uri, vscode.ViewColumn.Active);
};

/**
 * 建立新檔案並回傳該新檔案所在目錄的最新內容
 */
const handleCreateFile = async (params: { dirPath: string }): Promise<ReadDirectoryResult | null> => {
  const fileName = await vscode.window.showInputBox({ prompt: "輸入新檔案名稱", placeHolder: "檔案名稱" });
  if (!fileName) return null;

  const filePath = path.join(params.dirPath, fileName);

  const { error } = await tryCatch(() => fs.promises.writeFile(filePath, ""));
  if (error) {
    vscode.window.showErrorMessage(`無法建立新檔案: ${error instanceof Error ? error.message : "未知錯誤"}`);
    return null;
  }

  const uri = vscode.Uri.file(filePath);
  vscode.commands.executeCommand("vscode.open", uri);

  return await handleReadDirectory({ dirPath: params.dirPath });
};

/**
 * 建立新資料夾並回傳該新資料夾所在目錄的最新內容
 */
const handleCreateDir = async (params: { dirPath: string }): Promise<ReadDirectoryResult | null> => {
  const folderName = await vscode.window.showInputBox({ prompt: "輸入新資料夾名稱", placeHolder: "資料夾名稱" });
  if (!folderName) return null;

  const { error } = await tryCatch(() => fs.promises.mkdir(path.join(params.dirPath, folderName)));
  if (error) {
    vscode.window.showErrorMessage(`無法建立新資料夾: ${error instanceof Error ? error.message : "未知錯誤"}`);
    return null;
  }

  return await handleReadDirectory({ dirPath: params.dirPath });
};

/**
 * 以指定的路徑在目標環境中打開
 */
const handleOpenInTarget = async (params: { dirPath: string; target: "workspace" | "terminal" | "imageWall" }) => {
  const { dirPath, target } = params;

  if (target === "workspace") {
    const uri = vscode.Uri.file(dirPath);
    vscode.commands.executeCommand("vscode.openFolder", uri, true);
    return;
  }
  if (target === "terminal") {
    const terminal = vscode.window.createTerminal({ cwd: dirPath });
    terminal.show();
    return;
  }
  if (target === "imageWall") {
    vscode.commands.executeCommand("1ureka.imageWall.openFromPath", dirPath);
    return;
  }
};

/**
 * 開啟一個可以填入路徑的的輸入框，並在輸入後返回該路徑，若路徑是檔案則返回該檔案所在目錄
 */
const handleOpenPathInputBox = async (params: { dirPath: string }) => {
  const inputPath = await vscode.window.showInputBox({
    title: "前往...",
    prompt: "輸入路徑",
    placeHolder: "/path/to/directory/or/file",
    value: params.dirPath,
  });

  if (!inputPath) return null;

  const resolvedPath = path.resolve(inputPath);
  const stats = await fs.promises.stat(resolvedPath).catch(() => null);
  if (!stats) {
    vscode.window.showErrorMessage("路徑不存在");
    return null;
  }

  if (stats.isFile()) return path.dirname(resolvedPath);
  if (stats.isDirectory()) return resolvedPath;
  return null;
};

export { handleShowInformationMessage, handleInitialData };
export { handleCreateFile, handleCreateDir };
export { handleReadDirectory, handleOpenFile, handleOpenInTarget, handleOpenPathInputBox };
