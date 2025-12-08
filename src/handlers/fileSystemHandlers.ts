import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import fsExtra from "fs-extra";

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

/**
 * 將提供的字串寫入系統剪貼簿
 */
const handleSetSystemClipboard = async (params: { text: string }) => {
  vscode.env.clipboard.writeText(params.text);
};

/**
 * 處理複製或移動單個檔案/資料夾的請求
 */
const handleCopyMove = (params: { type: "copy" | "move"; src: string; dest: string; overwrite: boolean }) => {
  const { type, src, dest, overwrite } = params;

  if (type === "copy") {
    return fsExtra.copy(src, dest, { overwrite, preserveTimestamps: true });
  } else if (type === "move") {
    return fsExtra.move(src, dest, { overwrite });
  }
};

/**
 * 使用者選擇要對剪貼簿中的項目執行的操作時的標題
 */
const pastePickOptions: vscode.QuickPickOptions = {
  title: "對於每個項目...",
  placeHolder: "請選擇對於剪貼簿的每個項目，要執行的操作",
};

/**
 * 使用者選擇要對剪貼簿中的項目執行的操作時的選項
 */
const pasteOptions: (vscode.QuickPickItem & { type?: "copy" | "move"; overwrite?: boolean })[] = [
  {
    label: "複製",
    kind: vscode.QuickPickItemKind.Separator,
  },
  {
    iconPath: new vscode.ThemeIcon("copy"),
    label: "複製",
    description: "不覆蓋",
    detail:
      "對於單一項目，若為檔案且目標有相同名稱，則跳過；若為資料夾且目標有相同名稱，則將來源內容合併至目標，不覆蓋目標中已存在的檔案。",
    type: "copy",
    overwrite: false,
  },
  {
    iconPath: new vscode.ThemeIcon("copy"),
    label: "複製",
    description: "$(warning) 覆蓋",
    detail: "如果目標位置已有相同項目，會直接以來源項目取代，原有內容將被覆蓋。",
    type: "copy",
    overwrite: true,
  },
  {
    label: "移動",
    kind: vscode.QuickPickItemKind.Separator,
  },
  {
    iconPath: new vscode.ThemeIcon("go-to-file"),
    label: "移動",
    description: "不覆蓋",
    detail: "對於單一項目，只要目標位置已存在相同項目或該項目的部分內容，就會跳過執行該項目的移動操作。",
    type: "move",
    overwrite: false,
  },
  {
    iconPath: new vscode.ThemeIcon("go-to-file"),
    label: "移動",
    description: "$(warning) 覆蓋",
    detail: "如果目標位置已有相同項目，會直接以來源項目取代，原有內容將被覆蓋。",
    type: "move",
    overwrite: true,
  },
];

/**
 * 產生錯誤報告訊息所需的參數
 */
type GenerateErrorParams = {
  action: string; // 例如 "複製"、"移動"
  itemCount: number; // 該次操作的項目總數
  itemFailures: Record<string, string>; // { 項目名稱: 錯誤訊息 }
  sideEffects: Record<string, { message: string; severity: "safe" | "high" }>; // { 範圍描述: 說明 }
};

/**
 * 產生錯誤報告訊息 (Markdown 格式)
 */
function generateErrorMessage({ action, itemCount, itemFailures, sideEffects }: GenerateErrorParams): string {
  const failureCount = Object.keys(itemFailures).length;
  const successCount = itemCount - failureCount;
  const failureEntries = Object.entries(itemFailures);
  const sideEffectEntries = Object.entries(sideEffects);

  const now = new Date();
  const formattedTime = now.toLocaleString();

  const title = `# ${action} 操作中出現錯誤`;

  const summary = [
    "## 概要",
    `- 操作類型：**${action}**`,
    `- 產生時間：${formattedTime}`,
    `- 總共嘗試操作項目：**${itemCount}**`,
    `- 成功項目：**${successCount}**`,
    `- 失敗項目：**${failureCount}**`,
  ].join("\n");

  const failureDetails = [
    "## 發生錯誤的項目",
    "",
    "下列為每個失敗項目與對應錯誤訊息：",
    "",
    ...failureEntries.map(([itemName, msg]) => `- **${itemName}**: ${msg}`),
  ].join("\n");

  const getSideEffectMessage = ([scope, params]: (typeof sideEffectEntries)[number]) => {
    const icon = params.severity === "high" ? "⚠" : "✓";
    return `- ${icon} **${scope}**: ${params.message}`;
  };

  const sideEffectSection =
    sideEffectEntries.length === 0
      ? "## 影響範圍\n\n> 無顯著副作用或影響範圍。\n"
      : ["## 影響範圍", "", "下列為此操作可能造成的影響：", "", ...sideEffectEntries.map(getSideEffectMessage)].join(
          "\n"
        );

  return [title, summary, failureDetails, sideEffectSection].join("\n\n---\n\n");
}

/**
 * 處理使用者從剪貼簿貼上的請求，會開始一個完整的操作流程，並在錯誤時提供詳細的錯誤報告
 */
const handlePaste = async (params: { srcList: string[]; destDir: string }) => {
  const { srcList, destDir } = params;

  const pick = await vscode.window.showQuickPick(pasteOptions, pastePickOptions);
  if (!pick || !pick.type || pick.overwrite === undefined) return;

  const { type, overwrite } = pick;
  const errors: Record<string, string> = {};

  const totalOperations = srcList.length;
  const progressPerOperation = 100 / totalOperations;
  const progressOptions: vscode.ProgressOptions = {
    location: vscode.ProgressLocation.Notification,
    title: type === "copy" ? "正在複製..." : "正在移動...",
    cancellable: false,
  };

  await vscode.window.withProgress(progressOptions, async (progress) => {
    for (let i = 0; i < srcList.length; i++) {
      const src = srcList[i];
      try {
        const dest = path.join(destDir, path.basename(src));
        await handleCopyMove({ type, src, dest, overwrite });
      } catch (error) {
        errors[src] = error instanceof Error ? error.message : "未知錯誤";
      } finally {
        progress.report({ increment: progressPerOperation });
      }
    }
  });

  if (Object.keys(errors).length <= 0) {
    return;
  }

  let sideEffects: Record<string, { message: string; severity: "safe" | "high" }> = {};

  if (type === "copy" && !overwrite) {
    sideEffects["來源資料"] = { message: "完全不受影響", severity: "safe" };
    sideEffects["目標原資料"] = { message: "原本的資料不受影響", severity: "safe" };
    sideEffects["目標新資料"] = { message: "可能有未複製完全的資料在其中", severity: "high" };
  }

  if (type === "copy" && overwrite) {
    sideEffects["來源資料"] = { message: "完全不受影響", severity: "safe" };
    sideEffects["目標原資料"] = { message: "原本的資料可能有些已經被覆蓋", severity: "high" };
    sideEffects["目標新資料"] = { message: "可能有未複製完全的資料在其中", severity: "high" };
  }

  if (type === "move" && !overwrite) {
    sideEffects["來源資料"] = {
      message:
        "若錯誤為刪除錯誤，則只是造成來源資料未被刪除；若為其他錯誤，則完全不受影響，沒有任何文件被刪除(包括搬移到一半的)",
      severity: "safe",
    };
    sideEffects["目標原資料"] = { message: "原本的資料不受影響", severity: "safe" };
    sideEffects["目標新資料"] = { message: "可能有未搬移完全的資料在其中", severity: "high" };
  }

  if (type === "move" && overwrite) {
    sideEffects["來源資料"] = {
      message:
        "若錯誤為刪除錯誤，則只是造成來源資料未被刪除；若為其他錯誤，則完全不受影響，沒有任何文件被刪除(包括搬移到一半的)",
      severity: "safe",
    };
    sideEffects["目標原資料"] = { message: "原本的資料可能有些已經被覆蓋", severity: "high" };
    sideEffects["目標新資料"] = { message: "可能有未搬移完全的資料在其中", severity: "high" };
  }

  const errorContent = generateErrorMessage({
    action: type === "copy" ? "複製" : "移動",
    itemCount: totalOperations,
    itemFailures: errors,
    sideEffects,
  });

  const doc = await vscode.workspace.openTextDocument({ content: errorContent, language: "markdown" });
  vscode.window.showTextDocument(doc, { preview: false });
};

export { handleShowInformationMessage, handleInitialData, handleSetSystemClipboard };
export { handleCreateFile, handleCreateDir, handlePaste };
export { handleReadDirectory, handleOpenFile, handleOpenInTarget, handleOpenPathInputBox };
