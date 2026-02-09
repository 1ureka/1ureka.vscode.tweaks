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

/** 將 Date 物件格式化為 "DD MMM YYYY HH:MM" 的固定長度字串。(例如: 18 Nov 2025 22:49) */
function formatFixedLengthDateTime(dateObj: Date): string {
  const day = dateObj.getDate().toString().padStart(2, "0"); // 日 (DD, 兩位數)
  const year = dateObj.getFullYear(); // 年 (YYYY, 四位數)

  const hour = dateObj.getHours().toString().padStart(2, "0"); // 時 (HH, 兩位數)
  const minute = dateObj.getMinutes().toString().padStart(2, "0"); // 分 (MM, 兩位數)

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[dateObj.getMonth()]; // (MMM)

  const formattedString = `${day} ${month} ${year} ${hour}:${minute}`;
  return formattedString;
}

/** 用於格式化相對時間的 Intl.RelativeTimeFormat 實例，使用 undefined 讓它自動抓取環境語系 */
const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

/** 定義時間單位及其對應的進位門檻 */
const divisions: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, name: "second" },
  { amount: 60, name: "minute" },
  { amount: 24, name: "hour" },
  { amount: 7, name: "day" },
  { amount: 4.34524, name: "week" },
  { amount: 12, name: "month" },
  { amount: Infinity, name: "year" },
];

/** 將 Date 物件格式化為本地語系的相對現在時間字串 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  let duration = (date.getTime() - now.getTime()) / 1000;

  for (const division of divisions) {
    // 如果絕對值小於當前單位的進位門檻
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.name);
    }
    // 進入下一個更大的單位
    duration /= division.amount;
  }

  return "";
}

/** 格式化檔案大小為易讀字串 */
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

export { formatFixedLengthDateTime, formatRelativeTime };
export { formatDateCompact, formatDateFull, formatFileSize };
