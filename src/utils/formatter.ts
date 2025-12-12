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

/** 格式化檔案大小為易讀字串 */
function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  else if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  else if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  else return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
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

export { formatPathArray, formatDateCompact, formatDateFull, formatFileSize, formatFileType, generateErrorMessage };
