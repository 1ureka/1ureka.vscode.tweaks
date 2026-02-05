import { invoke } from "@explorer/store/init";
import { createLRUCache, createTTLCache } from "@/utils/client/cache";

/**
 * 用於快取縮圖的 LRU 資源管理器
 */
const thumbnailCache = createLRUCache(
  async (filePath: string) => {
    const data = await invoke("system.read.thumbnail", { filePath });
    if (!data) throw new Error("Thumbnail generation failed");
    return `data:image/webp;base64,${data}`;
  },
  { limit: 200 },
);

/**
 * 用於快取檔案屬性的資源管理器
 */
const fileAttributesCache = createTTLCache(
  async (filePath: string) => {
    const attrs = await invoke("system.read.file.attributes", { filePath });
    return attrs;
  },
  { ttl: 100 }, // 立刻過期
);

/**
 * 用於快取檔案可用性狀態的資源管理器
 */
const fileAvailabilityCache = createTTLCache(
  async (filePath: string) => {
    const status = await invoke("system.read.file.availability", { filePath });
    return status;
  },
  { ttl: 100 }, // 立刻過期
);

/**
 * 用於快取目錄大小資訊的資源管理器
 */
const directorySizeInfoCache = createTTLCache(
  async (dirPath: string) => {
    const info = await invoke("system.read.dir.sizeinfo", { dirPath });
    return info;
  },
  { ttl: 100 }, // 立刻過期
);

/**
 * 用於快取圖片詳細資訊的資源管理器
 */
const imageMetadataCache = createTTLCache(
  async (filePath: string) => {
    const detail = await invoke("system.read.image.metadata", { filePath });
    return detail;
  },
  { ttl: 60000 }, // 1 分鐘，因為圖片元數據通常不會頻繁變更
);

export { thumbnailCache, fileAttributesCache, fileAvailabilityCache, directorySizeInfoCache, imageMetadataCache };
