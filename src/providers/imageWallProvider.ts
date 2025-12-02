import * as vscode from "vscode";
import * as path from "path";

import type { ImageWallInitialData, ImageWallPageData } from "../handlers/imageWallHandlers";
import { handleGenerateThumbnail, handleClickImage, handleCopyImage } from "@/handlers/imageWallHandlers";
import { handlePrepareInitialData, handlePreparePageData } from "@/handlers/imageWallHandlers";
import { createWebviewPanelManager } from "@/utils/webview";
import { onDidReceiveInvoke } from "@/utils/message_host";

import imageWallLight from "@/assets/image-wall-light.svg";
import imageWallDark from "@/assets/image-wall-dark.svg";

// ---------------------------------------------------------------------------------
// 定義延伸主機端所有可呼叫的處理器 API 型別
// ---------------------------------------------------------------------------------

type ShowInfoAPI = { id: "showInfo"; handler: (info: string) => void };
type GetPageDataAPI = { id: "getPageData"; handler: (page: number) => ImageWallPageData };
type GenerateThumbnailAPI = { id: "generateThumbnail"; handler: (id: string) => Promise<string | undefined> };
type ClickImageAPI = { id: "clickImage"; handler: (id: string) => void };
type CopyImageAPI = { id: "copyImage"; handler: (id: string) => void };

export type { ShowInfoAPI, GetPageDataAPI, GenerateThumbnailAPI, ClickImageAPI, CopyImageAPI };

/**
 * 提供圖片牆面板的管理功能，包括創建和獲取當前面板
 */
function ImageWallPanelProvider(context: vscode.ExtensionContext) {
  const panelManager = createWebviewPanelManager(context);

  const createPanel = async (folderPath: string) => {
    const { initialData, images } = await handlePrepareInitialData({ folderPath });

    const panel = panelManager.create<ImageWallInitialData>({
      panelId: "1ureka.imageWall",
      panelTitle: `圖片牆 - ${path.basename(folderPath)}`,
      webviewType: "imageWall",
      extensionUri: context.extensionUri,
      resourceUri: vscode.Uri.file(folderPath),
      initialData,
      iconPath: { light: vscode.Uri.parse(imageWallLight), dark: vscode.Uri.parse(imageWallDark) },
    });

    onDidReceiveInvoke<ShowInfoAPI>(panel, "showInfo", vscode.window.showInformationMessage);
    onDidReceiveInvoke<GetPageDataAPI>(panel, "getPageData", (page) => handlePreparePageData({ page, images }));
    onDidReceiveInvoke<GenerateThumbnailAPI>(panel, "generateThumbnail", async (id: string) => {
      const image = images.find((img) => img.id === id);
      if (image) return handleGenerateThumbnail({ filePath: image.metadata.filePath });
    });

    onDidReceiveInvoke<ClickImageAPI>(panel, "clickImage", (id: string) => {
      const image = images.find((img) => img.id === id);
      if (image) handleClickImage({ filePath: image.metadata.filePath });
    });

    onDidReceiveInvoke<CopyImageAPI>(panel, "copyImage", (id: string) => {
      const image = images.find((img) => img.id === id);
      if (image) handleCopyImage({ filePath: image.metadata.filePath });
    });
  };

  return { getCurrentPanel: panelManager.getCurrent, createPanel };
}

export { ImageWallPanelProvider };
