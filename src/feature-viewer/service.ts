import * as vscode from "vscode";
import * as path from "path";

import { formatOptions, generateProgressOptions } from "@/feature-viewer/config";
import { handleCopyImage } from "@/feature-viewer/handlers";
import { exportImage } from "@/utils/host/image";

/**
 * 顯示資訊提示訊息
 */
const showInfo = (message: string) => {
  vscode.window.showInformationMessage(message);
};

/**
 * 顯示錯誤警告訊息
 */
const showError = (message: string) => {
  vscode.window.showErrorMessage(message);
};

/**
 * 複製圖片到剪貼簿的流程
 */
async function runCopyWorkflow(filePath: string) {
  if (process.platform !== "win32") {
    await vscode.env.clipboard.writeText(filePath);
    vscode.window.showInformationMessage(`已複製圖片路徑: ${filePath}`);
    return;
  }

  await vscode.window.withProgress(generateProgressOptions("正在複製圖片"), async (progress) => {
    try {
      await handleCopyImage(filePath, (params) => progress.report(params));
      vscode.window.showInformationMessage("圖片二進位資料已複製到剪貼簿");
    } catch (error) {
      const message = `複製圖片到剪貼簿失敗: ${error instanceof Error ? error.message : String(error)}`;
      vscode.window.showErrorMessage(message);
    }
  });
}

/**
 * 導出圖片的流程
 */
async function runExportWorkflow(filePath: string) {
  const formatOption = await vscode.window.showQuickPick(formatOptions, {
    placeHolder: "選擇導出格式",
    title: "圖片導出格式",
  });

  if (!formatOption) return;

  const sourceName = path.basename(filePath, path.extname(filePath));
  const defaultFileName = `${sourceName}${formatOption.extension}`;

  const uri = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file(path.join(path.dirname(filePath), defaultFileName)),
    filters: { Images: [formatOption.extension.replace(".", "")] },
    saveLabel: "導出",
    title: `導出為 ${formatOption.label}`,
  });

  if (!uri) return;

  const sourcePath = filePath;
  const savePath = uri.fsPath;
  const format = formatOption.format;

  await vscode.window.withProgress(generateProgressOptions("正在導出圖片"), async (progress) => {
    try {
      await exportImage({ report: (params) => progress.report(params), sourcePath, savePath, format });

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
}

/**
 * 複製顏色值至剪貼簿的流程
 */
async function runCopyColorWorkflow(color: string) {
  await vscode.env.clipboard.writeText(color);
  vscode.window.showInformationMessage(`選取的顏色 ${color} 已複製到剪貼簿`);
}

/**
 * 圖片檢視器核心服務，封裝了 UI 交互與圖片操作相關功能
 */
export const imageViewerService = {
  "show.info": showInfo,
  "show.error": showError,
  "image.export": runExportWorkflow,
  "image.copy": runCopyWorkflow,
  "image.copyColor": runCopyColorWorkflow,
};
