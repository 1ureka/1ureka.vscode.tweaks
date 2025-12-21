import * as path from "path";
import { generateBase64, generateThumbnail, openImages, type ImageMetadata } from "@/utils/image";
import { copyImageBinaryToSystem } from "@/utils/system_windows";
import { pathToArray } from "@/utils/system";

/**
 * 由插件主機一開始就注入 html (類似 SSR)的資料型別
 */
type ImageWallInitialData = {
  folderPath: string;
  folderPathParts: string[];
  images: ImageMetadata[];
};

/**
 * 準備圖片牆開啟所需的初始資料
 */
async function handleInitialData(folderPath: string) {
  const resolvedFolderPath = path.resolve(folderPath);

  const initialData: ImageWallInitialData = {
    folderPath: resolvedFolderPath,
    folderPathParts: pathToArray(resolvedFolderPath),
    images: [],
  };

  return initialData;
}

/**
 * 根據指定目錄讀取並回傳所有其中直接子層且是圖片的元資料
 */
async function handleReadImages(folderPath: string, report: (params: { increment: number; message: string }) => void) {
  const resolvedFolderPath = path.resolve(folderPath);

  let lastProgress = 0;

  const images = await openImages(resolvedFolderPath, (message, percent) => {
    const increment = percent - lastProgress;
    report({ increment, message });
    lastProgress = percent;
  });

  return images;
}

/**
 * 產生圖片縮圖的事件處理函式
 */
async function handleGenerateThumbnail({ filePath }: { filePath: string }) {
  const base64 = await generateThumbnail(filePath);
  if (!base64) return;
  return base64;
}

/**
 * 處理複製圖片到剪貼簿的請求
 */
const handleCopyImage = async (filePath: string, report: (params: { increment: number; message: string }) => void) => {
  report({ increment: 10, message: "正在轉碼中..." });

  const base64 = await generateBase64(filePath, "png");
  if (!base64) throw new Error("指定的路徑不是圖片檔案");

  report({ increment: 60, message: "正在傳送至剪貼簿..." });

  await copyImageBinaryToSystem(base64);

  report({ increment: 100, message: "圖片二進位資料已複製到剪貼簿" });
};

export { handleInitialData, handleReadImages, handleGenerateThumbnail, handleCopyImage };
export type { ImageWallInitialData };
