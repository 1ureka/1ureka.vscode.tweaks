import { extensionTypeMap } from "@/assets/fileExtMap";

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

/** 產生錯誤報告訊息所需的參數 */
type GenerateErrorParams = {
  action: string; // 例如 "複製"、"移動"
  itemCount: number; // 該次操作的項目總數
  itemFailures: Record<string, string>; // { 項目名稱: 錯誤訊息 }
  sideEffects: Record<string, { message: string; severity: "safe" | "high" }>; // { 範圍描述: 說明 }
};

/** 產生錯誤報告訊息 (Markdown 格式) */
function generateErrorMessage({ action, itemCount, itemFailures, sideEffects }: GenerateErrorParams): string {
  const failureCount = Object.keys(itemFailures).length;
  const successCount = itemCount - failureCount;
  const failureEntries = Object.entries(itemFailures);
  const sideEffectEntries = Object.entries(sideEffects);

  const now = new Date();
  const formattedTime = now.toLocaleString();

  const title = `# ${action} 操作中出現錯誤`;

  const summary = [
    "## 概要",
    `- 操作類型：**${action}**`,
    `- 產生時間：${formattedTime}`,
    `- 總共嘗試操作項目：**${itemCount}**`,
    `- 成功項目：**${successCount}**`,
    `- 失敗項目：**${failureCount}**`,
  ].join("\n");

  const failureDetails = [
    "## 發生錯誤的項目",
    "",
    "下列為每個失敗項目與對應錯誤訊息：",
    "",
    ...failureEntries.map(([itemName, msg]) => `- **${itemName}**: ${msg}`),
  ].join("\n");

  const getSideEffectMessage = ([scope, params]: (typeof sideEffectEntries)[number]) => {
    const icon = params.severity === "high" ? "⚠" : "✓";
    return `- ${icon} **${scope}**: ${params.message}`;
  };

  const sideEffectSection =
    sideEffectEntries.length === 0
      ? "## 影響範圍\n\n> 無顯著副作用或影響範圍。\n"
      : ["## 影響範圍", "", "下列為此操作可能造成的影響：", "", ...sideEffectEntries.map(getSideEffectMessage)].join(
          "\n"
        );

  return [title, summary, failureDetails, sideEffectSection].join("\n\n---\n\n");
}

/** 粗略檔案類型標籤對應表 (fallback) */
const fileTypeLabels: Record<string, string> = {
  file: "檔案",
  folder: "資料夾",
  "file-symlink-file": "符號連結檔案",
  "file-symlink-directory": "符號連結資料夾",
};

/** 格式化為可讀的檔案類型名稱 */
const formatFileType = (params: { fileName: string; fileType: string }): string => {
  let label = fileTypeLabels[params.fileType] || "未知類型";

  if (params.fileType !== "file") return label;

  const fileName = params.fileName.toLowerCase();
  const extension = fileName.includes(".") ? fileName.split(".").pop() || "" : "";

  if (extension in extensionTypeMap) {
    label = extensionTypeMap[extension];
  }

  return label;
};

export { formatFixedLengthDateTime, formatRelativeTime };
export { formatPathArray, formatDateCompact, formatDateFull, formatFileSize, formatFileType, generateErrorMessage };
