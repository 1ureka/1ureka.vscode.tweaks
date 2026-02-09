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
 * 取得物件的型別安全鍵陣列
 */
const typedKeys = <T extends object>(obj: T) => {
  return Object.keys(obj) as Array<keyof T>;
};

export { tryCatch, typedKeys };
