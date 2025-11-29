import * as path from "path";
import * as fs from "fs";
import type { UUID } from "crypto";

import { tryCatch } from "../utils/tryCatch";
import { formatPathToArray } from "../utils/formatter";
import { inspectFile, isRootDirectory } from "../utils/system";
import { pipeWithDependency } from "../utils/pipe";
import type { InspectResult } from "../utils/system";
import type { Prettify } from "../utils/type";

/** 擴展檔案屬性型別，包含圖示資訊 */
type FileProperties = Prettify<InspectResult & { icon: `codicon codicon-${string}` }>;

/** 對於一個項目來說，先以 overrides 為主，若無定義則 isDefaultSelected 時為選取，否則不選取 */
type SparseSelection = {
  isDefaultSelected: boolean; // aka isAllSelected
  overrides: { [filePath: string]: boolean };
};

/** 由插件主機一開始就注入 html (類似 SSR) 的資料型別，同時也是後續每一頁資料的型別 */
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
  filter: "all" | "files" | "folders";
  files: FileProperties[];
  selection: SparseSelection;
  selectionCount: number;
  timestamp: number;
};

/** 處理檔案系統資料所需的參數型別 */
type FileSystemDataParams = Pick<
  FileSystemData,
  "panelId" | "folderPath" | "page" | "sortField" | "sortOrder" | "filter" | "selection"
>;

/** 一頁檔案系統包含的檔案數量 */
const FILES_PER_PAGE = 100;

// -------------------------------------------------
// 獲取檔案系統資料的處理程序
// -------------------------------------------------

/**
 * 掃描指定資料夾，取得其內容的檔案屬性列表
 */
const handleScanFolder = async (folderPath: string): Promise<FileProperties[]> => {
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

  return results.filter((item) => item !== null);
};

/**
 * 根據代入的檔案屬性列表，計算其資料夾與檔案數量
 */
const handleCountFilesAndFolders = (files: FileProperties[]): { fileCount: number; folderCount: number } => {
  let folderCount = 0;
  let fileCount = 0;

  files.forEach(({ fileType }) => {
    if (fileType === "folder") folderCount += 1;
    else if (fileType === "file") fileCount += 1;
  });

  return { fileCount, folderCount };
};

/**
 * 根據篩選條件將帶入的檔案列表進行篩選，並回傳新的檔案列表
 */
const handleFilterFiles = (files: FileProperties[], params: FileSystemDataParams): FileProperties[] => {
  const { filter } = params;

  return files.filter((file) => {
    if (filter === "all") return true;
    if (filter === "files") return file.fileType === "file";
    if (filter === "folders") return file.fileType === "folder";
    return true;
  });
};

/**
 * 根據排序欄位與排序順序，對帶入的檔案列表進行排序，回傳新的檔案列表
 */
const handleSortFiles = (files: FileProperties[], params: FileSystemDataParams): FileProperties[] => {
  const { sortField, sortOrder } = params;

  // 先將資料夾置頂，再依照指定欄位與順序排序
  return [...files].sort((a, b) => {
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
};

/**
 * 根據參數中的 SparseSelection 狀態描述，驗證後回傳新的 SparseSelection 狀態，並計算選取數量
 */
const handleSelectionState = (files: FileProperties[], params: FileSystemDataParams) => {
  const { overrides, isDefaultSelected } = params.selection;

  const filePathSet = new Set(files.map((file) => file.filePath));

  // 驗證 overrides 中的路徑是否存在於目前檔案列表中，移除不存在的路徑
  const validatedOverrides = Object.fromEntries(Object.entries(overrides).filter(([path]) => filePathSet.has(path)));

  // 開始計算選取數量
  let selectionCount = 0;
  if (isDefaultSelected) {
    // 計算未選取的數量，再用總數扣除
    const deselectedCount = Object.values(validatedOverrides).filter((selected) => !selected).length;
    selectionCount = files.length - deselectedCount;
  } else {
    selectionCount = Object.values(validatedOverrides).filter((selected) => selected).length;
  }

  const validatedSelection: SparseSelection = { isDefaultSelected, overrides: validatedOverrides };
  return { selection: validatedSelection, selectionCount };
};

/**
 * 根據頁碼與每頁檔案數量，計算出正確的分頁索引範圍，並回傳切割後的檔案列表與有效頁碼
 */
const handleCalculatePageIndices = (files: FileProperties[], params: FileSystemDataParams) => {
  const { page } = params;
  const totalPages = Math.ceil(files.length / FILES_PER_PAGE);

  // 修正頁碼：如果請求的頁碼超出範圍，自動修正為最後一頁（或第一頁）
  const validPage = page > totalPages ? Math.max(1, totalPages) : page;
  const startIndex = (validPage - 1) * FILES_PER_PAGE;
  const endIndex = startIndex + FILES_PER_PAGE;

  const slicedFiles = files.slice(startIndex, endIndex);

  return { slicedFiles, validPage, totalPages };
};

/**
 * 準備檔案系統的任一路徑與任一頁的資料
 * 雖然這等同於每次換頁都重新讀取資料夾內容，但這樣可以確保每次讀取的都是最新的檔案系統狀態，更貼近實際需求
 * @throws 無法讀取資料夾內容時會拋出錯誤
 */
const handleFileSystemData = async (params: FileSystemDataParams): Promise<FileSystemData> => {
  const { folderPath } = params;

  const rawFiles = await handleScanFolder(folderPath);
  const { fileCount, folderCount } = handleCountFilesAndFolders(rawFiles);

  const processedFiles = pipeWithDependency(handleFilterFiles, handleSortFiles)(params)(rawFiles);

  const { selection, selectionCount } = handleSelectionState(processedFiles, params);
  const { slicedFiles, validPage, totalPages } = handleCalculatePageIndices(processedFiles, params);

  return {
    ...params,
    folderPath,
    folderPathParts: formatPathToArray(folderPath),
    root: isRootDirectory(folderPath),
    page: validPage,
    pages: totalPages,
    fileCount,
    folderCount,
    selection,
    selectionCount,
    files: slicedFiles,
    timestamp: Date.now(),
  };
};

export { handleFileSystemData };
export type { FileSystemDataParams, FileSystemData, FileProperties };
