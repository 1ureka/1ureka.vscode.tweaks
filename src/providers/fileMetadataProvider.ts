import * as vscode from "vscode";
import { formatDateCompact, formatDateFull, formatFileSize } from "@/utils/formatter";
import { handleGetFileMetadata } from "@/handlers/fileMetadataHandlers";

type FileInfo = {
  fileName: string;
  createdDate: Date;
  modifiedDate: Date;
  fileSize: number;
};

type ImageInfo = FileInfo & {
  width?: number;
  height?: number;
  format?: string;
  space?: string;
  channels?: number;
  hasAlpha?: boolean;
};

/**
 * 為圖片檔案設定狀態列 UI
 */
function setImageStatusBar(statusBarItem: vscode.StatusBarItem, info: ImageInfo) {
  const { fileName, createdDate, modifiedDate, fileSize, width, height, format, space, channels, hasAlpha } = info;

  const resolution = width && height ? `${width} × ${height}` : "未知";
  const aspectRatio = width && height ? `${(width / height).toFixed(2)} : 1` : "未知";
  const createdCompact = formatDateCompact(createdDate);
  const createdFull = formatDateFull(createdDate);
  const modifiedFull = formatDateFull(modifiedDate);
  const formattedFileSize = formatFileSize(fileSize);

  statusBarItem.name = "圖片屬性";
  statusBarItem.text = `$(device-camera) ${resolution} | $(history) ${createdCompact}`;

  const paddingSymbol = "&nbsp;".repeat(2);
  let tooltipContent = `### \`${fileName}\`\n\n`;
  tooltipContent += `- **解析度:** ${resolution}${paddingSymbol}\n\n`;
  tooltipContent += `- **長寬比:** ${aspectRatio}${paddingSymbol}\n\n`;
  tooltipContent += `- **格式:** ${format?.toUpperCase() || "未知"}${paddingSymbol}\n\n`;

  if (space) tooltipContent += `- **色彩空間:** ${space}${paddingSymbol}\n\n`;
  if (channels) tooltipContent += `- **色彩通道:** ${channels}${paddingSymbol}\n\n`;
  if (hasAlpha !== undefined) tooltipContent += `- **透明通道:** ${hasAlpha ? "是" : "否"}${paddingSymbol}\n\n`;

  tooltipContent += `- **檔案大小:** ${formattedFileSize}${paddingSymbol}\n\n`;
  tooltipContent += `- **建立時間:** ${createdFull}${paddingSymbol}\n\n`;
  tooltipContent += `- **修改時間:** ${modifiedFull}`;

  statusBarItem.tooltip = new vscode.MarkdownString(tooltipContent);
  statusBarItem.show();
}

/**
 * 為一般檔案設定狀態列 UI
 */
function setFileStatusBar(statusBarItem: vscode.StatusBarItem, info: FileInfo) {
  const { fileName, createdDate, modifiedDate, fileSize } = info;

  const createdCompact = formatDateCompact(createdDate);
  const modifiedCompact = formatDateCompact(modifiedDate);
  const createdFull = formatDateFull(createdDate);
  const modifiedFull = formatDateFull(modifiedDate);
  const formattedFileSize = formatFileSize(fileSize);

  statusBarItem.name = "檔案屬性";
  statusBarItem.text = `$(history) ${createdCompact} | $(pencil) ${modifiedCompact}`;

  const paddingSymbol = "&nbsp;".repeat(2);
  statusBarItem.tooltip = new vscode.MarkdownString(
    `### \`${fileName}\`\n\n- **建立時間:** ${createdFull}${paddingSymbol}\n\n- **修改時間:** ${modifiedFull}` +
      `\n\n- **檔案大小:** ${formattedFileSize}`
  );

  statusBarItem.show();
}

// ---------------------------------------------------------------------------------

/**
 * 提供檔案元資料狀態欄的管理功能
 */
const FileMetadataProvider = (context: vscode.ExtensionContext) => {
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  context.subscriptions.push(statusBarItem);

  /**
   * 根據給定的 URI 更新狀態列顯示
   */
  async function updateStatusBarFromUri(uri: vscode.Uri | undefined) {
    if (!uri || uri.scheme !== "file") {
      statusBarItem.hide();
      return;
    }

    const info = await handleGetFileMetadata(uri.fsPath);
    if (!info) {
      statusBarItem.hide();
      return;
    }

    if ("width" in info && "height" in info) setImageStatusBar(statusBarItem, info);
    else setFileStatusBar(statusBarItem, info);
  }

  /**
   * 從目前活動的分頁更新狀態列顯示
   */
  async function updateFromActiveTab() {
    const activeTab = vscode.window.tabGroups.activeTabGroup?.activeTab;
    if (!activeTab) {
      statusBarItem.hide();
      return;
    }

    // 根據實測，不管是可以打開的 *.js, *.ts，還是不可能打開的 *.blend, *.fbx，又或是處在中間的 *.png, *.jpg等
    // 也就是任何檔案類型的 Tab input 都必定包含 uri 屬性
    // 而像是 Thunder client 頁面, 歡迎頁面等則沒有
    // 這剛好符合需求: 對任意檔案顯示其元資料，對非檔案則不顯示
    const input = activeTab.input;
    if (input && typeof input === "object") {
      if ("uri" in input && input.uri instanceof vscode.Uri) {
        await updateStatusBarFromUri(input.uri);
        return;
      }
    }

    statusBarItem.hide();
  }

  return { updateFromActiveTab };
};

export { FileMetadataProvider };
export type { FileInfo, ImageInfo };
