/** 定義可序列化的基本型別 */
type Serializable = string | number | boolean | null | undefined | { [key: string]: Serializable } | Serializable[];

/** 資源狀態：pending (載入中), success (成功), error (失敗) */
type SuspenseStatus = "pending" | "success" | "error";

/** 資源物件：符合 React Suspense 規範，呼叫 read() 時若未完成會 throw Promise */
type Resource<T> = { read: () => T };

/** LRU 快取選項 */
type LRUOptions = { limit?: number };

/** TTL 快取選項 */
type TTLOptions = { ttl?: number };

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

/**
 * 將 Promise 包裝成符合 React Suspense 規範的資源物件
 * @param promise 要包裝的 Promise
 */
function createResource<T>(promise: Promise<T>): Resource<T> {
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

/**
 * 建立一個具有 LRU 快取機制的資源管理器，使一個 promise 在單個組件中避免無限迴圈，在多個組件中避免重複請求
 * @param fetcher 用於取得資料的非同步函式
 * @param options 快取選項，例如限制快取大小
 */
function createLRUCache<T, Args extends Serializable[]>(
  fetcher: (...args: Args) => Promise<T>,
  options: LRUOptions = {}
) {
  const { limit = 100 } = options;
  const cache = new Map<string, Resource<T>>();

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

/**
 * 建立一個具有 TTL (Time-To-Live) 快取機制的資源管理器，使一個 promise 在指定時間內重複使用快取結果
 * @param fetcher 用於取得資料的非同步函式
 * @param options 快取選項，例如 TTL 時間
 */
function createTTLCache<T, Args extends Serializable[]>(
  fetcher: (...args: Args) => Promise<T>,
  options: TTLOptions = {}
) {
  const { ttl = 5 * 60 * 1000 } = options; // 預設 TTL 為 5 分鐘
  const cache = new Map<string, { resource: Resource<T>; expiry: number | null }>();

  return {
    get(...args: Args): Resource<T> {
      const key = stableStringify(args);
      const entry = cache.get(key);
      const now = Date.now();

      // 只有在 promise 真的結束時才判斷過期，避免 fetcher 所花的時間比 TTL 還長導致立即過期
      if (entry && entry.expiry !== null && now > entry.expiry) {
        cache.delete(key);
      }

      const existing = cache.get(key);
      if (existing) return existing.resource;

      const promise = fetcher(...args);
      const resource = createResource(promise);
      cache.set(key, { resource, expiry: null });

      // 當 promise 結束後設定過期時間
      promise.finally(() => {
        const cachedEntry = cache.get(key);
        if (cachedEntry) {
          cachedEntry.expiry = Date.now() + ttl;
        }
      });

      return resource;
    },
    invalidate: (...args: Args) => cache.delete(stableStringify(args)),
    clear: () => cache.clear(),
  };
}

// ---------------------------------------------------------------------------------

export { createLRUCache, createTTLCache };
