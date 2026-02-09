/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  declare module "*.css" {
    const value: string;
    export default value;
  }
}

// ------------------------------------------------------------------------------

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
  ...infer Rem,
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
 * 一個可以執行需要報告進度的函數的函數
 */
type WithProgress = <T>(
  taskName: string,
  taskFn: (report: (params: { increment: number; message?: string }) => void) => Promise<T>,
) => Promise<T>;

export type { Prettify, OneOf, Promised, WithProgress };
