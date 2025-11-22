import * as path from "path";

/**
 * 將路徑轉換為陣列
 */
function pathToArray(inputPath: string): string[] {
  const normalized = path.normalize(inputPath);
  return normalized.split(path.sep).filter(Boolean);
}

/**
 * 格式化路徑為美觀的字串
 */
export function formatPath(inputPath: string): string {
  const parts = pathToArray(inputPath);

  if (parts.length > 0 && /^[a-zA-Z]:$/.test(parts[0])) {
    parts[0] = parts[0].toUpperCase();
  }

  return path.posix.join(...parts);
}
