import * as vscode from "vscode";
import * as path from "path";
import { copyImage } from "../utils/system_windows";
import { type ExportFormat, exportImage } from "@/utils/image";

/**
 * 處理複製圖片到剪貼簿的請求
 */
const handleCopyImage = async (filePath: string) => {
  if (process.platform !== "win32") {
    const uri = vscode.Uri.file(filePath);
    await vscode.env.clipboard.writeText(uri.fsPath);
    vscode.window.showInformationMessage(`已複製圖片路徑: ${uri.fsPath}`);
    return;
  }

  vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: "正在複製圖片", cancellable: false },
    async (progress) => {
      progress.report({ increment: 0, message: "讀取圖片中..." });

      try {
        await copyImage(filePath, (message, percent) => progress.report({ increment: percent, message }));
        const message = "圖片已複製到剪貼簿\n\n可以直接貼到其他應用中 (如 Word 、瀏覽器等)";
        progress.report({ increment: 100 });
        vscode.window.showInformationMessage(message);
      } catch (error) {
        const message = `複製圖片到剪貼簿失敗: ${error instanceof Error ? error.message : String(error)}`;
        vscode.window.showErrorMessage(message);
      }
    }
  );
};

/**
 * 處理使用者使用吸管工具選取顏色後的請求
 */
const handleEyeDropper = async (color: string) => {
  await vscode.env.clipboard.writeText(color);
  vscode.window.showInformationMessage(`選取的顏色 ${color} 已複製到剪貼簿`);
};

/**
 * 開始導出圖片流程
 */
const startExportImage = async (sourceFilePath: string, savePath: string, format: ExportFormat) => {
  const withProgressOptions = {
    title: "正在導出圖片",
    location: vscode.ProgressLocation.Notification,
    cancellable: false,
  };

  await vscode.window.withProgress(withProgressOptions, async (progress) => {
    try {
      await exportImage((options) => progress.report(options), sourceFilePath, savePath, format);

      const openAction = "開啟檔案";
      const result = await vscode.window.showInformationMessage(`圖片已成功導出至：\n${savePath}`, openAction);
      if (result === openAction) {
        await vscode.commands.executeCommand("vscode.open", vscode.Uri.file(savePath));
      }
    } catch (error) {
      const message = `導出圖片失敗: ${error instanceof Error ? error.message : String(error)}`;
      vscode.window.showErrorMessage(message);
    }
  });
};

/**
 * 格式選項介面
 */
interface FormatOption extends vscode.QuickPickItem {
  format: ExportFormat;
  extension: string;
}

/**
 * 可供選擇的格式選項
 */
const formatOptions: FormatOption[] = [
  {
    label: "PNG",
    description: "無損壓縮，支援透明度",
    detail: "適合需要透明背景的圖片",
    format: "png",
    extension: ".png",
  },
  {
    label: "JPEG",
    description: "有損壓縮，檔案較小",
    detail: "適合相片或不需要透明度的圖片",
    format: "jpeg",
    extension: ".jpg",
  },
  {
    label: "WebP",
    description: "現代格式，壓縮率高",
    detail: "有損壓縮，品質優於 JPEG ，且支援透明度",
    format: "webp",
    extension: ".webp",
  },
  {
    label: "WebP (無損)",
    description: "無損壓縮，支援透明度",
    detail: "若應用程式支援，相比 PNG 其檔案通常更小但品質相同",
    format: "webp-lossless",
    extension: ".webp",
  },
];

/**
 * 處理導出圖片的請求
 */
const handleExportImage = async (imagePath: string) => {
  const pickerOptions = { placeHolder: "選擇導出格式", title: "圖片導出格式" };
  const formatOption = await vscode.window.showQuickPick(formatOptions, pickerOptions);
  if (!formatOption) return;

  const sourceName = path.basename(imagePath, path.extname(imagePath));
  const defaultFileName = `${sourceName}${formatOption.extension}`;

  const uri = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file(path.join(path.dirname(imagePath), defaultFileName)),
    filters: { Images: [formatOption.extension.replace(".", "")] },
    saveLabel: "導出",
    title: `導出為 ${formatOption.label}`,
  });

  if (!uri) return;

  return startExportImage(imagePath, uri.fsPath, formatOption.format);
};

export { handleCopyImage, handleEyeDropper, handleExportImage };
