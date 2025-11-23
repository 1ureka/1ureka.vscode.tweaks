import * as path from "path";

/** 將路徑轉換為陣列 */
function pathToArray(inputPath: string): string[] {
  const normalized = path.normalize(inputPath);
  return normalized.split(path.sep).filter(Boolean);
}

/** 格式化路徑為美觀的字串 */
function formatPath(inputPath: string): string {
  const parts = pathToArray(inputPath);

  if (parts.length > 0 && /^[a-zA-Z]:$/.test(parts[0])) {
    parts[0] = parts[0].toUpperCase();
  }

  return path.posix.join(...parts);
}

/** 格式化日期為 "MM-DD HH:mm" */
function formatDateCompact(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hours}:${minutes}`;
}

/** 格式化日期為 "YYYY-MM-DD HH:mm:ss" */
function formatDateFull(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/** 格式化檔案大小為易讀字串 */
function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  else if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  else if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  else return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export { formatPath, formatDateCompact, formatDateFull, formatFileSize };
