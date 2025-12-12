import * as vscode from "vscode";
import * as path from "path";

import type { ImageWallInitialData } from "../handlers/imageWallHandlers";
import { handleInitialData, handleReadImages } from "@/handlers/imageWallHandlers";
import { handleCopyImage, handleGenerateThumbnail } from "@/handlers/imageWallHandlers";
import { createWebviewPanelManager } from "@/utils/webview";
import { onDidReceiveInvoke } from "@/utils/message_host";

import imageWallLight from "@/assets/image-wall-light.svg";
import imageWallDark from "@/assets/image-wall-dark.svg";

// ---------------------------------------------------------------------------------
// 定義延伸主機端所有可呼叫的處理器 API 型別
// ---------------------------------------------------------------------------------

type ShowInfoAPI = {
  id: "showInfo";
  handler: (info: string) => void;
};
type ShowErrorAPI = {
  id: "showError";
  handler: (error: string) => void;
};
type GenerateMetadataAPI = {
  id: "generateMetadata";
  handler: () => ReturnType<typeof handleReadImages>;
};
type GenerateThumbnailAPI = {
  id: "generateThumbnail";
  handler: (params: { filePath: string }) => Promise<string | undefined>;
};
type ClickImageAPI = {
  id: "clickImage";
  handler: (params: { filePath: string }) => void;
};
type CopyImageAPI = {
  id: "copyImage";
  handler: (params: { filePath: string }) => void;
};

export type { ShowInfoAPI, ShowErrorAPI, GenerateMetadataAPI, GenerateThumbnailAPI, ClickImageAPI, CopyImageAPI };

// ---------------------------------------------------------------------------------

/**
 * 提供圖片牆面板的管理功能，包括創建和獲取當前面板
 */
function ImageWallPanelProvider(context: vscode.ExtensionContext) {
  const panelManager = createWebviewPanelManager(context);

  /** 產生 withProgress 選項 */
  const generateProgressOptions = (title: string) => {
    return { title, location: vscode.ProgressLocation.Notification, cancellable: false };
  };

  /** 處理複製圖片到剪貼簿的請求 */
  const copyImage = async (filePath: string) => {
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
  };

  /** 創建並顯示一個新的圖片牆面板 */
  const createPanel = async (folderPath: string) => {
    const initialData = await handleInitialData(folderPath);

    const panel = panelManager.create<ImageWallInitialData>({
      panelId: "1ureka.imageWall",
      panelTitle: `圖片牆 - ${path.basename(folderPath)}`,
      webviewType: "imageWall",
      extensionUri: context.extensionUri,
      resourceUri: vscode.Uri.file(folderPath),
      initialData,
      iconPath: { light: vscode.Uri.parse(imageWallLight), dark: vscode.Uri.parse(imageWallDark) },
    });

    onDidReceiveInvoke<ShowInfoAPI>(panel, "showInfo", (info) => {
      vscode.window.showInformationMessage(info);
    });
    onDidReceiveInvoke<ShowErrorAPI>(panel, "showError", (error) => {
      vscode.window.showErrorMessage(error);
    });
    onDidReceiveInvoke<GenerateMetadataAPI>(panel, "generateMetadata", async () => {
      return await vscode.window.withProgress(generateProgressOptions("讀取圖片牆元資料中"), (progress) => {
        return handleReadImages(folderPath, (params) => progress.report(params));
      });
    });
    onDidReceiveInvoke<GenerateThumbnailAPI>(panel, "generateThumbnail", async ({ filePath }) => {
      return handleGenerateThumbnail({ filePath });
    });
    onDidReceiveInvoke<ClickImageAPI>(panel, "clickImage", ({ filePath }) => {
      const uri = vscode.Uri.file(filePath);
      vscode.commands.executeCommand("vscode.open", uri, vscode.ViewColumn.Active);
    });
    onDidReceiveInvoke<CopyImageAPI>(panel, "copyImage", ({ filePath }) => {
      return copyImage(filePath);
    });
  };

  return { getCurrentPanel: panelManager.getCurrent, createPanel };
}

export { ImageWallPanelProvider };
