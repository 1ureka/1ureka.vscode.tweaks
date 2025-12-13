import * as fs from "fs";
import * as path from "path";
import fsExtra from "fs-extra";

import { tryCatch } from "@/utils";
import { generateErrorMessage } from "@/utils/formatter";
import { readDirectory, inspectDirectory, isRootDirectory, pathToArray } from "@/utils/system";
import type { InspectDirectoryEntry } from "@/utils/system";
import type { PromiseOpt, WithProgress } from "@/utils";

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
  const currentPathParts = pathToArray(currentPath);
  const isCurrentRoot = isRootDirectory(currentPath);

  const baseInfo = { currentPath, currentPathParts, isCurrentRoot };

  return { ...baseInfo, entries: [], folderCount: 0, fileCount: 0, timestamp: Date.now() };
};

/**
 * 掃描資料夾內容，讀取檔案系統資訊並回傳
 */
const handleReadDirectory = async (params: { dirPath: string }): Promise<ReadDirectoryResult> => {
  const currentPath = path.resolve(params.dirPath);
  const currentPathParts = pathToArray(currentPath);
  const isCurrentRoot = isRootDirectory(currentPath);

  const baseInfo = { currentPath, currentPathParts, isCurrentRoot };
  const counts = { folderCount: 0, fileCount: 0 };

  const entries = await readDirectory(currentPath);
  if (!entries) {
    return { ...baseInfo, entries: [], ...counts, timestamp: Date.now() };
  }

  const inspectedEntries = await inspectDirectory(entries);
  inspectedEntries.forEach(({ fileType }) => {
    if (fileType === "folder") counts.folderCount++;
    else if (fileType === "file") counts.fileCount++;
  });

  return { ...baseInfo, entries: inspectedEntries, ...counts, timestamp: Date.now() };
};

/**
 * 建立新檔案並在成功後回傳該檔案的路徑
 */
async function handleCreateFile(params: {
  dirPath: string;
  fileName: string;
  showError: (error: string) => void;
  openFile?: (filePath: string) => void;
}) {
  const { dirPath, fileName, showError, openFile } = params;

  const filePath = path.join(dirPath, fileName);

  const { error } = await tryCatch(() => fs.promises.writeFile(filePath, ""));
  if (error) {
    showError(`無法建立新檔案: ${error instanceof Error ? error.message : "未知錯誤"}`);
    return null;
  }

  openFile?.(filePath);

  return handleReadDirectory({ dirPath });
}

/**
 * 建立新資料夾並回傳該新資料夾所在目錄的最新內容
 */
const handleCreateDir = async (params: { dirPath: string; folderName: string; showError: (error: string) => void }) => {
  const { dirPath, folderName, showError } = params;

  const { error } = await tryCatch(() => fs.promises.mkdir(path.join(dirPath, folderName)));
  if (error) {
    showError(`無法建立新資料夾: ${error instanceof Error ? error.message : "未知錯誤"}`);
    return null;
  }

  return handleReadDirectory({ dirPath });
};

/**
 * 處理跳轉路徑
 */
async function handleGoto(params: { getInputPath: () => PromiseOpt<string>; onError: (error: string) => void }) {
  const { getInputPath, onError } = params;

  const inputPath = await getInputPath();
  if (!inputPath) return null;

  const resolvedPath = path.resolve(inputPath);

  const stats = await fs.promises.stat(resolvedPath).catch(() => null);
  if (!stats) {
    onError("路徑不存在");
    return null;
  }

  if (stats.isFile()) {
    return handleReadDirectory({ dirPath: path.dirname(resolvedPath) });
  } else if (stats.isDirectory()) {
    return handleReadDirectory({ dirPath: resolvedPath });
  } else {
    onError("路徑不是有效的檔案或資料夾");
    return null;
  }
}

/**
 * 錯誤發生時的副作用說明對照表
 */
const sideEffectMap = {
  "copy-no-overwrite": {
    來源資料: { message: "完全不受影響", severity: "safe" },
    目標原資料: { message: "原本的資料不受影響", severity: "safe" },
    目標新資料: { message: "可能有未複製完全的資料在其中", severity: "high" },
  },
  "copy-overwrite": {
    來源資料: { message: "完全不受影響", severity: "safe" },
    目標原資料: { message: "原本的資料可能有些已經被覆蓋", severity: "high" },
    目標新資料: { message: "可能有未複製完全的資料在其中", severity: "high" },
  },
  "move-no-overwrite": {
    來源資料: {
      message:
        "若錯誤為刪除錯誤，則只是造成來源資料未被刪除；若為其他錯誤，則完全不受影響，沒有任何文件被刪除(包括搬移到一半的)",
      severity: "safe",
    },
    目標原資料: { message: "原本的資料不受影響", severity: "safe" },
    目標新資料: { message: "可能有未搬移完全的資料在其中", severity: "high" },
  },
  "move-overwrite": {
    來源資料: {
      message:
        "若錯誤為刪除錯誤，則只是造成來源資料未被刪除；若為其他錯誤，則完全不受影響，沒有任何文件被刪除(包括搬移到一半的)",
      severity: "safe",
    },
    目標原資料: { message: "原本的資料可能有些已經被覆蓋", severity: "high" },
    目標新資料: { message: "可能有未搬移完全的資料在其中", severity: "high" },
  },
} as const;

/**
 * 根據指定參數執行對應貼上操作，並在錯誤時提供詳細的錯誤報告
 */
const handlePaste = async (params: {
  srcList: string[];
  destDir: string;
  type: "copy" | "move";
  overwrite: boolean;
  withProgress: WithProgress;
  showErrorReport: (content: string) => void;
}): Promise<ReadDirectoryResult | null> => {
  const { srcList, destDir, type, overwrite, withProgress, showErrorReport } = params;

  const itemCount = srcList.length;
  const itemFailures: Record<string, string> = {};
  const progressPerItem = 100 / itemCount;

  await withProgress(type === "copy" ? "正在複製..." : "正在移動...", async (report) => {
    for (let i = 0; i < srcList.length; i++) {
      const src = srcList[i];
      const dest = path.join(destDir, path.basename(src));

      try {
        if (type === "copy") {
          await fsExtra.copy(src, dest, { overwrite, preserveTimestamps: true });
        } else if (type === "move") {
          await fsExtra.move(src, dest, { overwrite });
        }
      } catch (error) {
        itemFailures[src] = error instanceof Error ? error.message : "未知錯誤";
      } finally {
        report(progressPerItem);
      }
    }
  });

  if (Object.keys(itemFailures).length <= 0) return handleReadDirectory({ dirPath: destDir });

  const sideEffectKey = `${type}-${overwrite ? "overwrite" : "no-overwrite"}` as keyof typeof sideEffectMap;

  const errorContent = generateErrorMessage({
    action: type === "copy" ? "複製" : "移動",
    itemCount,
    itemFailures,
    sideEffects: sideEffectMap[sideEffectKey],
  });

  showErrorReport(errorContent);
  return handleReadDirectory({ dirPath: destDir });
};

/**
 * 處理重新命名檔案/資料夾
 */
const handleRename = async (params: {
  name: string;
  newName: string;
  dirPath: string;
  showError: (error: string) => void;
}) => {
  const { name, newName, dirPath, showError } = params;

  const src = path.join(dirPath, name);
  const dest = path.join(dirPath, newName);

  const { error } = await tryCatch(async () => {
    try {
      await fs.promises.access(dest);
      throw new Error("目標名稱已存在");
    } catch {
      await fs.promises.rename(src, dest);
    }
  });

  if (error) {
    showError(`無法重新命名: ${error instanceof Error ? error.message : "未知錯誤"}`);
  }

  return handleReadDirectory({ dirPath: path.dirname(dest) });
};

export { handleInitialData, handleCreateFile, handleCreateDir, handlePaste, handleRename };
export { handleReadDirectory, handleGoto };
