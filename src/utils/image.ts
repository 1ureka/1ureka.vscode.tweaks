import sharp from "sharp";
import * as path from "path";
import { typedKeys } from "@/utils";

/**
 * 在當前執行環境中，取得 sharp 支援的圖片格式清單
 */
const getSupportedFormats = () => {
  const formatKeys = typedKeys(sharp.format);
  return formatKeys.filter((format) => sharp.format[format].input.buffer || sharp.format[format].input.file);
};

/**
 * 取得 sharp 支援的圖片副檔名清單
 */
const getSupportedExtensions = () => {
  const formats = getSupportedFormats();
  const exts = formats.filter((v) => typeof v === "string").map((v) => v.toLowerCase());

  if (exts.includes("jpeg")) exts.push("jpg");
  if (exts.includes("jpg")) exts.push("jpeg");
  if (exts.includes("tiff")) exts.push("tif");
  if (exts.includes("tif")) exts.push("tiff");

  const set = new Set(exts.map((v) => `.${v}`));
  set.delete(".raw"); // 排除 raw 格式，因為其實際上不是圖片格式
  return set;
};

/**
 * 當前環境支援的圖片副檔名集合
 */
const supportedExtensions = getSupportedExtensions();

/**
 * 圖片的元資料
 * 註：為修復 icc, exif 等資料可能導致序列化錯誤的問題，改為只保留必要的欄位
 */
type ImageMetadata = { filePath: string; fileName: string } & Pick<
  sharp.Metadata,
  "width" | "height" | "format" | "space" | "channels" | "hasAlpha"
>;

/**
 * 打開單一圖片檔案，並回傳其 metadata，若非圖片或無法讀取則回傳 null
 */
async function openImage(filePath: string): Promise<ImageMetadata | null> {
  const ext = path.extname(filePath).toLowerCase();
  if (!supportedExtensions.has(ext)) return null;

  try {
    const metadata = await sharp(filePath).metadata();

    return {
      filePath,
      fileName: path.basename(filePath),
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      space: metadata.space,
      channels: metadata.channels,
      hasAlpha: metadata.hasAlpha,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
}

export { openImage };
export type { ImageMetadata };
