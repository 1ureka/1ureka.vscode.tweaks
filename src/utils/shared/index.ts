/* eslint-disable @typescript-eslint/no-explicit-any */

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
 * 將數值限制在指定區間內
 *
 * @example
 * const clampedValue = clamp({ value: 15, interval: [0, 10] }); // clampedValue 的值為 10
 * const clampedValue2 = clamp({ value: -5, interval: [0, 10] }); // clampedValue2 的值為 0
 * const clampedValue3 = clamp({ value: 5, interval: [0, 10] }); // clampedValue3 的值為 5
 */
const clamp = (params: { value: number; interval: [number, number] }) => {
  const { value, interval } = params;
  const [bound1, bound2] = interval;
  if (bound1 === bound2) return bound1;
  const min = Math.min(bound1, bound2);
  const max = Math.max(bound1, bound2);
  return Math.min(Math.max(value, min), max);
};

/**
 * 取得物件的型別安全鍵陣列
 */
const typedKeys = <T extends object>(obj: T) => {
  return Object.keys(obj) as Array<keyof T>;
};

export { tryCatch, typedKeys, defer, clamp };
