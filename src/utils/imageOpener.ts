import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import { inspect } from "util";

const supportedExtensions = [".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp", ".tiff", ".tif"];

type ExtendedMetadata = sharp.Metadata & { filePath: string; fileName: string };

/**
 * 打開單一圖片檔案，並回傳其 metadata，若非圖片或無法讀取則回傳 null
 */
async function openImage(filePath: string): Promise<ExtendedMetadata | null> {
  if (!fs.existsSync(filePath)) return null;

  const ext = path.extname(filePath).toLowerCase();
  if (!supportedExtensions.includes(ext)) return null;

  try {
    const metadata = await sharp(filePath).metadata();
    return { ...metadata, filePath, fileName: path.basename(filePath) };
  } catch (error) {
    return null;
  }
}

/**
 * 打開多個圖片檔案,並回傳其 metadata 陣列,非圖片或無法讀取的檔案會被忽略
 */
async function openImages(filePaths: string[]): Promise<ExtendedMetadata[]>;
/**
 * 打開資料夾中的所有圖片檔案,並回傳其 metadata 陣列
 */
async function openImages(fileFolder: string): Promise<ExtendedMetadata[]>;
async function openImages(input: string | string[]): Promise<ExtendedMetadata[]> {
  let filePaths: string[];

  if (typeof input === "string") {
    if (!fs.existsSync(input) || !fs.statSync(input).isDirectory()) {
      return [];
    }

    const files = fs.readdirSync(input);
    filePaths = files.map((file) => path.join(input, file));
  } else {
    filePaths = input;
  }

  const metadataPromises = filePaths.map((filePath) => openImage(filePath));
  // TODO 用 vscode.Progress 顯示讀取進度
  const metadataResults = await Promise.all(metadataPromises);

  console.log("讀取結果有: " + inspect(metadataResults));

  return metadataResults.filter((metadata) => metadata !== null);
}

export { openImage, openImages, type ExtendedMetadata };
