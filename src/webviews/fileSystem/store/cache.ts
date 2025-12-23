import { invoke } from "@@/fileSystem/store/init";

/** 定義可序列化的基本型別 */
type Serializable = string | number | boolean | null | undefined | { [key: string]: Serializable } | Serializable[];

type SuspenseStatus = "pending" | "success" | "error";

interface Resource<T> {
  read: () => T;
}

/** 穩定的序列化函式：確保物件順序不影響 Key 的生成 */
function stableStringify(val: unknown): string {
  return JSON.stringify(val, (_, v) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.keys(v)
          .sort()
          .reduce((r, k) => ({ ...r, [k]: v[k] }), {})
      : v
  );
}

// ---------------------------------------------------------------------------------

function createCache<T, Args extends Serializable[]>(fetcher: (...args: Args) => Promise<T>, limit: number = 100) {
  const cache = new Map<string, Resource<T>>();

  function createResource(promise: Promise<T>): Resource<T> {
    let status: SuspenseStatus = "pending";
    let result: T;
    let error: unknown;

    const suspender = promise.then(
      (res) => {
        status = "success";
        result = res;
      },
      (err) => {
        status = "error";
        error = err;
      }
    );

    return {
      read() {
        if (status === "pending") throw suspender;
        if (status === "error") throw error;
        return result;
      },
    };
  }

  return {
    /** 傳入的 args array 直接就是快取識別 */
    get(...args: Args): Resource<T> {
      const key = stableStringify(args);

      // 1. Hit (LRU)
      if (cache.has(key)) {
        const resource = cache.get(key)!;
        cache.delete(key);
        cache.set(key, resource);
        return resource;
      }

      // 2. Miss & LRU Cleanup
      if (cache.size >= limit) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey !== undefined) cache.delete(oldestKey);
      }

      // 3. Create
      const newResource = createResource(fetcher(...args));
      cache.set(key, newResource);
      return newResource;
    },
    invalidate: (...args: Args) => cache.delete(stableStringify(args)),
    clear: () => cache.clear(),
  };
}

// ---------------------------------------------------------------------------------

const thumbnailCache = createCache(async (filePath: string) => {
  const data = await invoke("system.generate.thumbnail", { filePath });
  if (!data) throw new Error("Thumbnail generation failed");
  return `data:image/webp;base64,${data}`;
}, 200);

export { thumbnailCache };
