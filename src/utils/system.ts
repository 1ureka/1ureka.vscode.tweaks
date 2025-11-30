import * as fs from "fs";
import * as path from "path";
import { tryCatch } from "./tryCatch";
import { formatFileSize } from "./formatter";
import type { Prettify } from "./type";

type ReadDirectoryEntry = {
  fileName: string;
  filePath: string;
  fileType: "file" | "folder" | "symlink";
};

type InspectDirectoryEntry = Prettify<
  Omit<ReadDirectoryEntry, "fileType"> & {
    fileType: "file" | "folder" | "file-symlink-file" | "file-symlink-directory";
    fileSize: string;
    size: number; // 若為資料夾則為 0
    mtime: number;
    ctime: number;
  }
>;

/**
 * 讀取指定目錄的內容，並回傳包含檔案名稱、路徑與型別的陣列。如果讀取失敗則回傳 null。
 */
async function readDirectory(dirPath: string): Promise<ReadDirectoryEntry[] | null> {
  const { data, error } = await tryCatch(() => fs.promises.readdir(dirPath, { withFileTypes: true }));
  if (error) return null;

  const formatted = data.map((dirent) => {
    const fileName = dirent.name;
    const filePath = path.join(dirPath, fileName);

    if (dirent.isFile()) {
      return { fileName, filePath, fileType: "file" } as const;
    } else if (dirent.isDirectory()) {
      return { fileName, filePath, fileType: "folder" } as const;
    } else if (dirent.isSymbolicLink()) {
      return { fileName, filePath, fileType: "symlink" } as const;
    } else {
      return null;
    }
  });

  return formatted.filter((entry) => entry !== null);
}

/**
 * 檢查並擴展讀取到的目錄條目，取得每個條目的詳細資訊，包括符號連結的解析。
 */
async function inspectDirectory(entries: ReadDirectoryEntry[]): Promise<InspectDirectoryEntry[]> {
  /** 針對非符號連結的檔案或資料夾進行處理 */
  const lstat = async ({ fileName, filePath, fileType }: ReadDirectoryEntry) => {
    if (fileType === "symlink") return null;

    const { data } = await tryCatch(() => fs.promises.lstat(filePath));
    if (!data) return null;

    const size = fileType === "folder" ? 0 : data.size;
    const fileSize = formatFileSize(size);
    const date = { mtime: data.mtime.getTime(), ctime: data.ctime.getTime() };
    return { fileName, filePath, fileType, fileSize, size, ...date };
  };

  /** 針對符號連結的檔案或資料夾進行處理 */
  const stat = async ({ fileName, filePath }: ReadDirectoryEntry) => {
    const { data: self } = await tryCatch(() => fs.promises.lstat(filePath));
    if (!self) return null;

    const { data: target } = await tryCatch(() => fs.promises.stat(filePath));
    if (!target) return null;

    let fileType: InspectDirectoryEntry["fileType"];
    if (target.isDirectory()) fileType = "file-symlink-directory";
    else if (target.isFile()) fileType = "file-symlink-file";
    else return null;

    const size = fileType === "file-symlink-directory" ? 0 : target.size;
    const fileSize = formatFileSize(size);
    const date = { mtime: self.mtime.getTime(), ctime: self.ctime.getTime() };
    return { fileName, filePath, fileType, fileSize, size, ...date };
  };

  const promises = entries.map(async (entry) => {
    const { fileType } = entry;

    if (fileType === "file" || fileType === "folder") {
      return lstat(entry);
    } else if (fileType === "symlink") {
      return stat(entry);
    } else {
      return null;
    }
  });

  return (await Promise.all(promises)).filter((entry) => entry !== null);
}

/**
 *檢查一個路徑是否已到達檔案系統的根目錄。如果已到達根目錄（沒有上一層目錄），則返回 true。
 */
function isRootDirectory(dirPath: string): boolean {
  const absolutePath = path.resolve(dirPath);
  const parentPath = path.dirname(absolutePath);
  return path.normalize(absolutePath) === path.normalize(parentPath);
}

export { readDirectory, inspectDirectory, isRootDirectory };
export type { ReadDirectoryEntry, InspectDirectoryEntry };
