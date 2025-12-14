import fs from "fs-extra";
import * as path from "path";
import { openImage } from "@/utils/image";
import type { FileInfo, ImageInfo } from "@/providers/fileMetadataProvider";

/**
 * 根據檔案路徑取得檔案的基本資訊，並且在檔案是圖片時，額外取得圖片的相關資訊。
 */
async function handleGetFileMetadata(filePath: string): Promise<FileInfo | ImageInfo | null> {
  try {
    const stats = fs.statSync(filePath);

    const baseInfo: FileInfo = {
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

export { handleGetFileMetadata };
