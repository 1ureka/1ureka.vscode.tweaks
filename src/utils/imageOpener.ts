import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

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

  return metadataResults.filter((metadata) => metadata !== null);
}

// 根據 1920x1080 (Full HD/1080p) 的總像素點數來定義「1K」的門檻。
const PIXELS_THRESHOLD_1K: number = 1920 * 1080; // 2073600

/**
 * 給定一個檔案路徑(假設已經確認是圖片)，若其解析度超過 1K，則壓縮後回傳 base64 字串，否則原圖轉 base64 回傳
 */
async function generateBase64Image(filePath: string): Promise<string | null> {
  const metadata = await openImage(filePath);
  if (!metadata) return null;

  const image = sharp(filePath);
  let buffer: Buffer;

  if (metadata.width && metadata.height && metadata.width * metadata.height > PIXELS_THRESHOLD_1K) {
    const { width, height } = metadata;

    const originalTotalPixels = width * height;
    const scaleFactor = Math.sqrt(PIXELS_THRESHOLD_1K / originalTotalPixels);
    const targetWidth = Math.floor(width * scaleFactor);

    buffer = await image.resize({ width: targetWidth }).webp().toBuffer();
  } else {
    buffer = await image.webp().toBuffer();
  }

  return buffer.toString("base64");
}

export { openImage, openImages, generateBase64Image, type ExtendedMetadata };
