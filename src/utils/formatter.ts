import dayjs from "dayjs";

/**
 * 格式化日期為 "MM-DD HH:mm"
 */
const formatDateCompact = (date: Date) => dayjs(date).format("MM-DD HH:mm");

/**
 * 格式化日期為 "YYYY-MM-DD HH:mm:ss"
 */
const formatDateFull = (date: Date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss");

/**
 * 格式化檔案大小為易讀字串
 */
function formatFileSize(size: number): string {
  const units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];
  let unitIndex = 0;
  let value = size;

  // 數值大於 999.995 時， toFixed(2) 會進位成 1000.00，導致長度不符預期，因此改用此方式處理
  while (value >= 999.9 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  const formattedValue = value.toFixed(2).padStart(6, " ");
  const formattedUnit = units[unitIndex].padEnd(3, " ");

  return `${formattedValue} ${formattedUnit}`;
}

export { formatDateCompact, formatDateFull, formatFileSize };
