import * as vscode from "vscode";
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
 * 處理圖片導出請求
 */
const handleExportImage = async (sourceFilePath: string, savePath: string, format: ExportFormat) => {
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

export { handleCopyImage, handleEyeDropper, handleExportImage };
