/**
 * 實現依賴注入的函數管道（Curried Pipe）。
 *
 * 該函數用於組合一系列形如 `(data, dependency) => data` 的雙參數函數。
 * 它會先接收依賴參數 `D`，然後返回一個新的管道函數。
 * 這個新的管道函數在執行時，會將 `D` 注入到每個被組合的函數中，
 * 實現從左到右的數據流處理。
 */
const pipeWithDependency =
  <T, D>(...fns: Array<(arg: T, dependency: D) => T>) =>
  (dependency: D) =>
  (initialValue: T): T => {
    const curriedFns = fns.map((fn) => (value: T) => fn(value, dependency));
    return curriedFns.reduce((value, fn) => fn(value), initialValue);
  };

export { pipeWithDependency };
