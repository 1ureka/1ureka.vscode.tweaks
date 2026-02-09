import * as vscode from "vscode";
import { formatDateCompact, formatDateFull, formatFileSize } from "@/utils/formatter";
import type { FileMetadata, ImageMetadata } from "@/metadata-display/handlers";

/**
 * 為圖片檔案設定狀態列 UI
 */
function renderImageMetadata(statusBarItem: vscode.StatusBarItem, info: ImageMetadata) {
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
function renderFileMetadata(statusBarItem: vscode.StatusBarItem, info: FileMetadata) {
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
      `\n\n- **檔案大小:** ${formattedFileSize}`,
  );

  statusBarItem.show();
}

export { renderImageMetadata, renderFileMetadata };
