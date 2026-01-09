import fs from "fs-extra";
import * as path from "path";
import { openImage } from "@/utils/host/image";

/**
 * 檔案基本元資料
 */
type FileMetadata = {
  fileName: string;
  createdDate: Date;
  modifiedDate: Date;
  fileSize: number;
};

/**
 * 圖片檔案元資料，包含圖片特有屬性
 */
type ImageMetadata = FileMetadata & {
  width?: number;
  height?: number;
  format?: string;
  space?: string;
  channels?: number;
  hasAlpha?: boolean;
};

/**
 * 根據檔案路徑取得檔案的基本資訊，並且在檔案是圖片時，額外取得圖片的相關資訊。
 */
async function getMetadata(filePath: string): Promise<FileMetadata | ImageMetadata | null> {
  try {
    const stats = fs.statSync(filePath);

    const baseInfo: FileMetadata = {
      fileName: path.basename(path.resolve(filePath)),
      createdDate: stats.birthtime,
      modifiedDate: stats.mtime,
      fileSize: stats.size,
    };

    const imageMetadata = await openImage(filePath);
    if (!imageMetadata) return baseInfo;

    const { width, height, format, space, channels, hasAlpha } = imageMetadata;
    return { ...baseInfo, width, height, format, space, channels, hasAlpha };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
}

export type { FileMetadata, ImageMetadata };
export { getMetadata };
