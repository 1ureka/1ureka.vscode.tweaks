import * as fs from "fs";
import * as path from "path";
import { tryCatch } from "./tryCatch";
import { formatFileSize } from "./formatter";

/**
 * 檔案或資料夾檢查結果型別
 */
type InspectResult = {
  fileName: string;
  filePath: string;
  fileType: "file" | "folder" | "file-symlink-file" | "file-symlink-directory";
  fileSize: string;
  size: number; // 若為資料夾則為 0
  mtime: number;
  ctime: number;
};

/**
 * 檢查指定路徑的檔案或資料夾資訊
 */
async function inspectFile(filePath: string): Promise<InspectResult | null> {
  const { data: info, error: infoError } = await tryCatch(() => fs.promises.lstat(filePath));
  if (infoError) return null;

  const fileName = path.basename(filePath);
  let fileType: InspectResult["fileType"];

  // 針對非符號連結的檔案或資料夾進行處理
  if (!info.isSymbolicLink()) {
    if (info.isFile()) fileType = "file";
    else if (info.isDirectory()) fileType = "folder";
    else return null;

    const size = info.isDirectory() ? 0 : info.size;
    const fileSize = formatFileSize(size);
    const date = { mtime: info.mtime.getTime(), ctime: info.ctime.getTime() };
    return { fileName, filePath, fileType, fileSize, size, ...date };
  }

  // 處理符號連結
  const { data: target, error: targetError } = await tryCatch(() => fs.promises.stat(filePath));
  if (targetError) return null; // 壞掉或目標不存在

  if (target.isDirectory()) fileType = "file-symlink-directory";
  else if (target.isFile()) fileType = "file-symlink-file";
  else return null;

  const size = fileType === "file-symlink-directory" ? 0 : target.size;
  const fileSize = formatFileSize(size);
  const date = { mtime: info.mtime.getTime(), ctime: info.ctime.getTime() };
  return { fileName, filePath, fileType, fileSize, size, ...date };
}

/**
 *檢查一個路徑是否已到達檔案系統的根目錄。如果已到達根目錄（沒有上一層目錄），則返回 true。
 */
function isRootDirectory(dirPath: string): boolean {
  const absolutePath = path.resolve(dirPath);
  const parentPath = path.dirname(absolutePath);
  return path.normalize(absolutePath) === path.normalize(parentPath);
}

export { inspectFile, isRootDirectory };
export type { InspectResult };
