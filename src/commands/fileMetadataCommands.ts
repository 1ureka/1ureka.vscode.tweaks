import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { formatDateCompact, formatDateFull, formatFileSize } from "../utils/formatter";
import { openImage } from "../utils/imageOpener";

function createStatusBarItem(): vscode.StatusBarItem {
  return vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
}

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

  if (space) {
    tooltipContent += `- **色彩空間:** ${space}${paddingSymbol}\n\n`;
  }
  if (channels) {
    tooltipContent += `- **色彩通道:** ${channels}${paddingSymbol}\n\n`;
  }
  if (hasAlpha !== undefined) {
    tooltipContent += `- **透明通道:** ${hasAlpha ? "是" : "否"}${paddingSymbol}\n\n`;
  }

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

async function updateStatusBarFromUri(statusBarItem: vscode.StatusBarItem, uri: vscode.Uri | undefined) {
  if (!uri || uri.scheme !== "file") {
    statusBarItem.hide();
    return;
  }

  const filePath = uri.fsPath;

  try {
    const stats = fs.statSync(filePath);
    const createdDate = stats.birthtime;
    const modifiedDate = stats.mtime;
    const fileSize = stats.size;
    const fileName = path.basename(path.resolve(filePath));

    const baseInfo: FileInfo = { fileName, createdDate, modifiedDate, fileSize };
    const imageMetadata = await openImage(filePath);

    if (imageMetadata) {
      const { width, height, format, space, channels, hasAlpha } = imageMetadata;
      setImageStatusBar(statusBarItem, { ...baseInfo, width, height, format, space, channels, hasAlpha });
    } else {
      setFileStatusBar(statusBarItem, baseInfo);
    }
  } catch (error) {
    statusBarItem.hide();
  }
}

async function updateFromActiveTab(statusBarItem: vscode.StatusBarItem) {
  const activeTab = vscode.window.tabGroups.activeTabGroup?.activeTab;

  if (!activeTab) {
    statusBarItem.hide();
    return;
  }

  // 嘗試從 tab input 取得 URI
  const input = activeTab.input;

  if (input && typeof input === "object") {
    // TabInputText, TabInputCustom 等都有 uri 屬性
    if ("uri" in input && input.uri instanceof vscode.Uri) {
      await updateStatusBarFromUri(statusBarItem, input.uri);
      return;
    }
  }

  // 如果無法從 input 取得,嘗試從 activeTextEditor
  if (vscode.window.activeTextEditor) {
    await updateStatusBarFromUri(statusBarItem, vscode.window.activeTextEditor.document.uri);
  } else {
    statusBarItem.hide();
  }
}

export function registerFileMetadataCommands(context: vscode.ExtensionContext) {
  const statusBarItem = createStatusBarItem();

  // 監聽 tab 變化 (同一分割視窗內切換分頁)
  context.subscriptions.push(
    vscode.window.tabGroups.onDidChangeTabs(() => {
      updateFromActiveTab(statusBarItem);
    })
  );

  // 監聽 tab group 變化 (不同分割視窗間切換)
  context.subscriptions.push(
    vscode.window.tabGroups.onDidChangeTabGroups(() => {
      updateFromActiveTab(statusBarItem);
    })
  );

  // 初始化顯示
  updateFromActiveTab(statusBarItem);

  context.subscriptions.push(statusBarItem);
}
