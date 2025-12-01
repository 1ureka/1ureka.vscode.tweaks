import * as fs from "fs";
import * as path from "path";
import { openImage } from "@/utils/image";
import type { FileInfo, ImageInfo } from "@/providers/fileMetadataProvider";

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
  } catch (error) {
    return null;
  }
}

export { handleGetFileMetadata };
