import { create } from "zustand";
import { invoke } from "@/utils/message_client";
import type { OneOf } from "@/utils/type";
import type { GenerateThumbnailAPI } from "@/providers/imageWallProvider";

/** data 是 base64 編碼的圖片數據，為了避免無限制增長，採用定期清理機制 */
type ImageCache = OneOf<
  [
    { status: "loading"; data: null; timestamp: number },
    { status: "loaded"; data: string; timestamp: number },
    { status: "error"; data: null; timestamp: number }
  ]
>;

type ImageCacheStore = {
  [filePath: string]: ImageCache;
};

const imageCacheStore = create<ImageCacheStore>(() => ({}));

/** 獲取某張圖片，並不會自動請求生成，請務必記得使用 `imageWallIntersectionObserver` 來監視元素 */
const useImageCache = (filePath: string) => {
  return imageCacheStore((state) => state[filePath]) as ImageCache | undefined;
};

/** 處理元素進入或離開視口的事件 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleIntersection = (entries: IntersectionObserverEntry[], _observer: IntersectionObserver) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const filePath = entry.target.id;
    if (!filePath) return;

    startImageGeneration(filePath, async (filePath) => {
      const result = await invoke<GenerateThumbnailAPI>("generateThumbnail", { filePath });
      if (!result) throw new Error("生成縮圖失敗");
      return result;
    });
  });
};

/** 在模組層級別創建 IntersectionObserver 單例，請自行在 `useEffect` 中呼叫 `observe` 和 `unobserve` */
const imageWallIntersectionObserver = new IntersectionObserver(handleIntersection, {
  root: null,
  rootMargin: "0px",
  threshold: 0.5,
});

/** 請求生成圖片 */
const startImageGeneration = async (filePath: string, fetcher: (filePath: string) => Promise<string>) => {
  const cache = imageCacheStore.getState();

  const entry = cache[filePath];
  if (entry?.status === "loading" || entry?.status === "loaded") {
    return;
  }

  imageCacheStore.setState({ [filePath]: { status: "loading", data: null, timestamp: Date.now() } });

  try {
    const data = await fetcher(filePath);
    imageCacheStore.setState({ [filePath]: { status: "loaded", data: data, timestamp: Date.now() } });
  } catch {
    imageCacheStore.setState({ [filePath]: { status: "error", data: null, timestamp: Date.now() } });
  }
};

/** 在 index.ts 中註冊定時清理快取的任務 */
const registerCacheClearInterval = ({ intervalMs, maxAgeMs }: { intervalMs: number; maxAgeMs: number }) => {
  setInterval(() => {
    const cache = imageCacheStore.getState();
    const newCache: ImageCacheStore = {};
    const now = Date.now();

    for (const [filePath, entry] of Object.entries(cache)) {
      // 正在載入中的圖片不清理，避免重複請求
      if (entry.status === "loading") {
        newCache[filePath] = entry;
        continue;
      }

      if (now - entry.timestamp <= maxAgeMs) {
        newCache[filePath] = entry;
      }
    }

    imageCacheStore.setState(newCache);
  }, intervalMs);
};

export { imageWallIntersectionObserver };
export { useImageCache, registerCacheClearInterval };
