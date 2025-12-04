/** 格式化路徑陣列 (用於在 windows 系統將磁碟機大寫顯示) */
function formatPathArray(array: string[]): string[] {
  const newArray = [...array];
  if (newArray.length > 0 && /^[a-zA-Z]:$/.test(newArray[0])) {
    newArray[0] = newArray[0].toUpperCase();
  }
  return newArray;
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

export { formatPathArray, formatDateCompact, formatDateFull, formatFileSize };
