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

type ProgressCallback = (message: string, percent: number) => void;

/**
 * 打開多個圖片檔案,並回傳其 metadata 陣列,非圖片或無法讀取的檔案會被忽略
 */
async function openImages(filePaths: string[], onProgress?: ProgressCallback): Promise<ExtendedMetadata[]>;
/**
 * 打開資料夾中的所有圖片檔案,並回傳其 metadata 陣列
 */
async function openImages(fileFolder: string, onProgress?: ProgressCallback): Promise<ExtendedMetadata[]>;
async function openImages(input: string | string[], onProgress?: ProgressCallback): Promise<ExtendedMetadata[]> {
  let filePaths: string[];
  onProgress?.("正在讀取圖片...", 0);

  if (typeof input === "string") {
    if (!fs.existsSync(input) || !fs.statSync(input).isDirectory()) {
      onProgress?.("指定的資料夾不存在或不是資料夾", 100);
      return [];
    }

    const files = fs.readdirSync(input);
    filePaths = files.map((file) => path.join(input, file));
  } else {
    filePaths = input;
  }

  const total = filePaths.length;
  let completed = 0;

  const metadataPromises = filePaths.map(async (filePath) => {
    const result = await openImage(filePath);
    completed++;
    const progress = Math.floor((completed / total) * 100 - 1);
    onProgress?.(`正在讀取圖片 (${completed}/${total})`, progress);
    return result;
  });

  const metadataResults = await Promise.all(metadataPromises);

  onProgress?.("圖片讀取完成", 100);
  return metadataResults.filter((metadata) => metadata !== null);
}

/**
 * 給定一個 sharp.Sharp 物件，將其轉換為指定格式的 base64 字串
 */
async function sharpToBase64(image: sharp.Sharp, format: "png" | "jpeg" | "webp" = "png"): Promise<string> {
  let buffer: Buffer;

  if (format === "webp") {
    buffer = await image.webp().toBuffer();
  } else if (format === "jpeg") {
    buffer = await image.jpeg().toBuffer();
  } else {
    buffer = await image.png().toBuffer();
  }

  return buffer.toString("base64");
}

// 根據 1920x1080 (Full HD/1080p) 的總像素點數來定義「1K」的門檻。
const PIXELS_THRESHOLD_1K: number = 1920 * 1080; // 2073600

/**
 * 給定一個檔案路徑(假設已經確認是圖片)，若其解析度超過 1K，則壓縮後回傳 base64 字串，否則原圖轉 base64 回傳
 */
async function generateThumbnail(filePath: string): Promise<string | null> {
  const metadata = await openImage(filePath);
  if (!metadata) return null;

  const image = sharp(filePath);

  if (metadata.width && metadata.height && metadata.width * metadata.height > PIXELS_THRESHOLD_1K) {
    const { width, height } = metadata;

    const originalTotalPixels = width * height;
    const scaleFactor = Math.sqrt(PIXELS_THRESHOLD_1K / originalTotalPixels);
    const targetWidth = Math.floor(width * scaleFactor);

    return sharpToBase64(image.resize({ width: targetWidth }), "webp");
  } else {
    return sharpToBase64(image, "webp");
  }
}

/**
 * 給定一個檔案路徑(假設已經確認是圖片)，產生指定格式的縮圖 base64 字串
 */
async function generateBase64(filePath: string, format: "png" | "jpeg" | "webp" = "png") {
  const metadata = await openImage(filePath);
  if (!metadata) return null;
  const image = sharp(filePath);
  return sharpToBase64(image, format);
}

export { openImage, openImages, generateThumbnail, generateBase64, type ExtendedMetadata };
