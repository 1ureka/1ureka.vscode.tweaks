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
  { limit: 200 }
);

/**
 * 用於快取檔案屬性的資源管理器
 */
const fileAttributesCache = createTTLCache(
  async (filePath: string) => {
    const attrs = await invoke("system.read.file.attributes", { filePath });
    return attrs;
  },
  { ttl: 100 } // 立刻過期
);

export { thumbnailCache, fileAttributesCache };
