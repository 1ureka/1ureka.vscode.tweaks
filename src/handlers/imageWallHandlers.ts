import * as vscode from "vscode";
import { randomUUID, type UUID } from "crypto";

import { generateThumbnail, openImages, type ExtendedMetadata } from "../utils/imageOpener";
import { formatPath, formatPathToArray } from "../utils/formatter";
import { copyImage } from "../utils/system_windows";

/**
 * 由插件主機一開始就注入 html (類似 SSR)的資料型別
 */
type ImageWallInitialData = {
  folderPath: string;
  folderPathParts: string[];
  page: number;
  pages: number;
  totalImages: number;
  images: { id: UUID; metadata: ExtendedMetadata }[];
};

/**
 * 由插件主機提供的每一頁圖片牆資料型別
 */
type ImageWallPageData = {
  page: number;
  images: { id: UUID; metadata: ExtendedMetadata }[];
};

/** 一頁圖片牆包含的圖片數量 */
const IMAGES_PER_PAGE = 120;

/**
 * 準備圖片牆開啟所需的初始資料，以及建立圖片牆所有圖片的元資料與 ID 關係，以便後續圖片事件處理能找到對應的圖片
 */
const handlePrepareInitialData = async (folderPath: string) => {
  const imageMetadata = await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: "開啟圖片牆中", cancellable: false },
    (progress) => {
      let lastProgress = 0;

      return openImages(folderPath, (message, percent) => {
        const increment = percent - lastProgress;
        progress.report({ increment, message });
        lastProgress = percent;
      });
    }
  );

  const images = imageMetadata.map((meta) => ({
    id: randomUUID(),
    metadata: meta,
  }));

  const initialData: ImageWallInitialData = {
    folderPath: formatPath(folderPath),
    folderPathParts: formatPathToArray(folderPath),
    page: 1,
    pages: Math.ceil(images.length / IMAGES_PER_PAGE),
    totalImages: images.length,
    images: images.slice(0, IMAGES_PER_PAGE),
  };

  return { initialData, images };
};

/**
 * 準備並傳送指定頁數的圖片牆資料給前端所需的參數型別
 */
type HanldePreparePageDataParams = {
  webview: vscode.Webview;
  images: Awaited<ReturnType<typeof handlePrepareInitialData>>["images"];
  page: number;
};

/**
 * 準備並傳送指定頁數的圖片牆資料給前端
 */
const handlePreparePageData = ({ webview, images, page }: HanldePreparePageDataParams) => {
  const startIndex = (page - 1) * IMAGES_PER_PAGE;
  const imagesInPage = images.slice(startIndex, startIndex + IMAGES_PER_PAGE);
  const data: ImageWallPageData = { page, images: imagesInPage };
  webview.postMessage({ type: "imageWallData", data });
};

/**
 * 處理前端要求的圖片相關事件的統一介面
 * @returns 回傳一個可能包含要回傳給前端的資料的 Promise 或不回傳任何東西
 */
type ImageHandler = (id: string, filePath: string) => Promise<Record<string, unknown> | void> | void;

/**
 * 產生圖片縮圖的事件處理函式
 */
const handleGenerateThumbnail: ImageHandler = async (id, filePath) => {
  const base64 = await generateThumbnail(filePath);
  if (!base64) return;
  return { type: "thumbnailGenerated", id, base64 };
};

/**
 * 點擊圖片的事件處理函式
 */
const handleClickImage: ImageHandler = (_, filePath) => {
  const uri = vscode.Uri.file(filePath);
  vscode.commands.executeCommand("vscode.open", uri, vscode.ViewColumn.Active);
};

/**
 * 複製圖片到剪貼簿的事件處理函式
 */
const handleCopyImage: ImageHandler = async (_, filePath) => {
  if (process.platform !== "win32") {
    const uri = vscode.Uri.file(filePath);
    await vscode.env.clipboard.writeText(uri.fsPath);
    vscode.window.showInformationMessage(`已複製圖片路徑: ${uri.fsPath}`);
    return;
  }

  const withProgressOptions: vscode.ProgressOptions = {
    location: vscode.ProgressLocation.Notification,
    title: "正在複製圖片",
    cancellable: false,
  };

  vscode.window.withProgress(withProgressOptions, async (progress) => {
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
  });
};

const imageHandlers: Record<string, ImageHandler> = {
  generateThumbnail: handleGenerateThumbnail,
  clickImage: handleClickImage,
  copyImage: handleCopyImage,
};

export { imageHandlers, handlePrepareInitialData, handlePreparePageData };
export type { ImageWallInitialData, ImageWallPageData };
