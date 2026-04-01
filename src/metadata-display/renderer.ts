import * as vscode from "vscode";
import { formatDateCompact, formatDateFull, formatFileSize } from "@/utils/formatter";
import type { FileMetadata, ImageMetadata } from "@/metadata-display/handlers";

/**
 * 渲染表格
 */
function renderTable(rows: [string, string][]) {
  const padding = "&nbsp;".repeat(2);
  const header = "| 屬性名稱 | 屬性值 |";
  const separator = "|---|---|";
  const body = rows.map(([label, value]) => `| ${label} | ${padding}${value.trim()} |`).join("\n");
  return `${header}\n${separator}\n${body}`;
}

/**
 * 為圖片檔案設定狀態列 UI
 */
function renderImageMetadata(statusBarItem: vscode.StatusBarItem, info: ImageMetadata) {
  const { fileName, createdDate, modifiedDate, fileSize, width, height, format, space, channels, hasAlpha } = info;

  const resolution = width && height ? `${width} × ${height}` : "未知";
  const aspectRatio = width && height ? `${(width / height).toFixed(2)} : 1` : "未知";
  const createdFull = formatDateFull(createdDate);
  const modifiedFull = formatDateFull(modifiedDate);
  const formattedFileSize = formatFileSize(fileSize);

  statusBarItem.name = "圖片屬性";
  statusBarItem.text = `$(device-camera) ${resolution}`;

  const rows: [string, string][] = [
    ["解析度", resolution],
    ["長寬比", aspectRatio],
    ["格式", format?.toUpperCase() || "未知"],
  ];

  if (space) rows.push(["色彩空間", space]);
  if (channels) rows.push(["色彩通道", `${channels}`]);
  if (hasAlpha !== undefined) rows.push(["透明通道", hasAlpha ? "是" : "否"]);

  rows.push(["檔案大小", formattedFileSize]);
  rows.push(["建立時間", createdFull]);
  rows.push(["修改時間", modifiedFull]);

  const tooltipContent = `### ${fileName}\n\n${renderTable(rows)}`;
  statusBarItem.tooltip = new vscode.MarkdownString(tooltipContent);
  statusBarItem.show();
}

/**
 * 為一般檔案設定狀態列 UI
 */
function renderFileMetadata(statusBarItem: vscode.StatusBarItem, info: FileMetadata) {
  const { fileName, createdDate, modifiedDate, fileSize } = info;

  const modifiedCompact = formatDateCompact(modifiedDate);
  const createdFull = formatDateFull(createdDate);
  const modifiedFull = formatDateFull(modifiedDate);
  const formattedFileSize = formatFileSize(fileSize);

  statusBarItem.name = "檔案屬性";
  statusBarItem.text = `$(history) ${modifiedCompact}`;

  const rows: [string, string][] = [
    ["檔案大小", formattedFileSize],
    ["建立時間", createdFull],
    ["修改時間", modifiedFull],
  ];

  const tooltipContent = `### ${fileName}\n\n${renderTable(rows)}`;
  statusBarItem.tooltip = new vscode.MarkdownString(tooltipContent);
  statusBarItem.show();
}

export { renderImageMetadata, renderFileMetadata };
