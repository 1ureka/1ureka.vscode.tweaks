/* eslint-disable @typescript-eslint/no-explicit-any */

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

export type { Prettify, OneOf, Promised, PromiseOpt };
export { tryCatch, defer };
