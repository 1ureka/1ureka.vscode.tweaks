/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-constraint */

/**
 * 將型別展開成較易閱讀的形式
 */
type Prettify<T> = { [K in keyof T]: T[K] } & {};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type MergeTypes<TypesArray extends any[], Res = {}> = TypesArray extends [infer Head, ...infer Rem]
  ? MergeTypes<Rem, Res | Head>
  : Res;

type OnlyFirst<F, S> = F & { [Key in keyof Omit<S, keyof F>]?: never };

/**
 * 給定一組型別陣列，回傳一個聯合型別，自動將任一型別中未出現的屬性設為 never
 */
type OneOf<TypesArray extends any[], Res = never, AllProps = MergeTypes<TypesArray>> = TypesArray extends [
  infer Head,
  ...infer Rem
]
  ? OneOf<Rem, Res | OnlyFirst<Head, AllProps>, AllProps>
  : Prettify<Res>;

/**
 * 將可能同步或非同步的函式回傳型別統一轉換為單層的 Promise 型別
 * @example
 * type SyncFn = () => number;
 * type AsyncFn = () => Promise<string>;
 *
 * type Result1 = Promised<SyncFn>; // Result1 的類型是 Promise<number>
 * type Result2 = Promised<AsyncFn>; // Result2 的類型是 Promise<string>
 */
type Promised<T extends (...args: any) => any> = Promise<Awaited<ReturnType<T>>>;

/**
 * Promise<T | undefined> 的語法糖
 */
type PromiseOpt<T extends any> = Promise<T | undefined>;

/**
 * 一個可以執行需要報告進度的函數的函數
 */
type WithProgress<T extends unknown = void> = (
  taskName: string,
  taskFn: (report: (increment: number) => void) => Promise<T>
) => Promise<T>;

/**
 * 一個可以執行需要報告 進度 + 進度訊息 的函數的函數
 */
type WithProgressMessage<T extends unknown = void> = (
  taskName: string,
  taskFn: (report: (params: { increment: number; message: string }) => void) => Promise<T>
) => Promise<T>;

// ------------------------------------------------------------------------------

type Success<T> = { data: T; error: null };
type Failure = { data: null; error: Error };
type Result<T> = Success<T> | Failure;

/**
 * 將可能會拋出錯誤的函數包裝起來，回傳一個 Result 型別，讓錯誤成為資料的一部分
 */
async function tryCatch<T>(fn: () => T | Promise<T>): Promise<Result<T>> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (err: unknown) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * 建立一個可在外部解析或拒絕的 Promise
 */
function defer<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

/**
 * 設定一個可調整間隔與次數的排程任務，與 setInterval 類似，因此不包含立即執行的選項
 * @param configs 排程設定陣列，每個元素包含 timeout (毫秒) 與 count (次數)
 * @param task 要執行的任務函式
 * @returns 一個可用來取消排程的函式
 *
 * @example
 * // 每 1 秒執行 60 次，接著每 60 秒執行，用於顯示 "1 秒前, ... 59 秒前, 1 分鐘前, ..." 的 UI 更新
 * const dispose = setSchedule({
 *   configs: [
 *     { timeout: 1000, count: 60 },   // 每 1 秒執行 60 次
 *     { timeout: 60000, count: Infinity } // 接著每 60 秒執行
 *   ],
 *   task: () => {
 *     console.log('重新顯示上次更新時間 UI');
 *   }
 * });
 */
function setSchedule({ configs, task }: { configs: { timeout: number; count: number }[]; task: () => void }) {
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let currentConfigIndex = 0;
  let currentCount = 0;
  let isCleared = false;

  /**
   * 採用先預約（setTimeout）後檢查（isCleared）
   * 相較於 setTimeout 前檢查，然後在 setTimeout 的 callback 裡再檢查一次的做法
   * 該實作使得 `if (isCleared)` 與最後的 `if (currentConfigIndex < configs.length)` 直接涵蓋所有 case
   * 且只要呼叫 run，由於必須帶入 config，因此不會有執行時未定義的情況發生
   */
  const run = (config: { timeout: number; count: number }) => {
    timerId = setTimeout(() => {
      if (isCleared) return;

      try {
        task();
      } catch (error) {
        console.error("Scheduled task error:", error);
      }

      currentCount++;

      // 判斷是否需要切換到下一個階段 (已涵蓋 config.count 為 0 甚至是負數的情況)
      if (currentCount >= config.count) {
        currentConfigIndex++;
        currentCount = 0;
      }

      // 檢查階段指標是否超出範圍，超出代表任務結束
      if (currentConfigIndex < configs.length) {
        const nextConfig = configs[currentConfigIndex];
        run(nextConfig);
      } else {
        dispose();
      }
    }, config.timeout);
  };

  const dispose = () => {
    isCleared = true;
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  // 啟動第一次執行
  if (configs.length > 0) {
    run(configs[currentConfigIndex]);
  }

  return dispose;
}

export type { Prettify, OneOf, Promised, PromiseOpt, WithProgress, WithProgressMessage };
export { tryCatch, defer, setSchedule };
