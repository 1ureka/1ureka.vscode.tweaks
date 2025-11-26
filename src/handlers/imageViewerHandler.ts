import * as vscode from "vscode";
import { copyImage } from "../utils/system_windows";

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

export { handleCopyImage, handleEyeDropper };
