import * as path from "path";
import * as fs from "fs";
import type { UUID } from "crypto";

import { tryCatch } from "../utils/tryCatch";
import { formatPathToArray } from "../utils/formatter";
import { inspectFile, isRootDirectory } from "../utils/system";
import type { InspectResult } from "../utils/system";
import type { Prettify } from "../utils/type";

/**
 * 檔案屬性型別，包含圖示資訊
 */
type FileProperties = Prettify<InspectResult & { icon: `codicon codicon-${string}` }>;

/**
 * 由插件主機一開始就注入 html (類似 SSR) 的資料型別，同時也是後續每一頁資料的型別
 */
type FileSystemData = {
  panelId: UUID;
  folderPath: string;
  folderPathParts: string[];
  root: boolean;
  page: number;
  pages: number;
  fileCount: number;
  folderCount: number;
  sortField: keyof Pick<FileProperties, "fileName" | "mtime" | "ctime" | "size">;
  sortOrder: "asc" | "desc";
  files: FileProperties[];
};

/** 處理檔案系統資料所需的參數型別 */
type FileSystemDataParams = Pick<FileSystemData, "panelId" | "folderPath" | "page" | "sortField" | "sortOrder">;

/** 一頁檔案系統包含的檔案數量 */
const FILES_PER_PAGE = 100;

/**
 * 準備檔案系統的任一路徑與任一頁的資料
 * 雖然這等同於每次換頁都重新讀取資料夾內容，但這樣可以確保每次讀取的都是最新的檔案系統狀態，更貼近實際需求
 * @throws 無法讀取資料夾內容時會拋出錯誤
 */
const handleFileSystemData = async (params: FileSystemDataParams): Promise<FileSystemData> => {
  const { panelId, folderPath, page, sortField, sortOrder } = params;

  const { data: dirEntries, error } = await tryCatch(() => fs.promises.readdir(folderPath, { withFileTypes: true }));
  if (error) throw new Error(`無法讀取資料夾內容: ${error.message}`);

  const results: (FileProperties | null)[] = await Promise.all(
    dirEntries.map(async (dirent) => {
      const fullPath = path.join(folderPath, dirent.name);
      const inspectResult = await inspectFile(fullPath);

      if (!inspectResult) return null;

      const icon: FileProperties["icon"] = `codicon codicon-${inspectResult.fileType}`;
      return { ...inspectResult, icon };
    })
  );

  const files = results.filter((item): item is FileProperties => item !== null);

  // 排序：資料夾優先，然後依照 sortField 與 sortOrder 排序
  files.sort((a, b) => {
    if (a.fileType === "folder" && b.fileType !== "folder") return -1;
    if (a.fileType !== "folder" && b.fileType === "folder") return 1;

    const valA = a[sortField];
    const valB = b[sortField];

    let compareResult: number;
    if (typeof valA === "string" && typeof valB === "string") {
      compareResult = valA.localeCompare(valB);
    } else {
      compareResult = Number(valA) - Number(valB);
    }

    return sortOrder === "asc" ? compareResult : -compareResult;
  });

  const folderCount = files.filter((f) => f.fileType === "folder").length;
  const fileCount = files.filter((f) => f.fileType === "file").length;

  // 計算分頁範圍
  const startIndex = (page - 1) * FILES_PER_PAGE;
  const endIndex = startIndex + FILES_PER_PAGE;

  return {
    panelId,
    folderPath,
    folderPathParts: formatPathToArray(folderPath),
    root: isRootDirectory(folderPath),
    page,
    pages: Math.ceil(files.length / FILES_PER_PAGE),
    fileCount,
    folderCount,
    sortField,
    sortOrder,
    files: files.slice(startIndex, endIndex),
  };
};

export { handleFileSystemData };
export type { FileSystemDataParams, FileSystemData, FileProperties };
