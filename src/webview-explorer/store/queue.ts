import { tryCatch, defer } from "@/utils/shared";
import { create } from "zustand";

// ------------------------------------------------------------------------------------------
// 用於避免 race condition 的請求佇列，同時也可以實現精準的 loading 狀態判斷，給 UI 使用
// ------------------------------------------------------------------------------------------

/**
 * 建立請求佇列，確保請求依序執行，只要還有請求在處理中，就會維持 loading 狀態
 */
function createRequestQueue(onLoadingChange: (loading: boolean) => void) {
  const queue: Array<() => Promise<void>> = [];
  let processing = false;

  /** 處理請求佇列，若該次呼叫時已經在處理了，則 return，因為正在處理的函數，最後仍會處理到該次呼叫所對應的請求 */
  async function processQueue() {
    if (processing || queue.length === 0) return;

    processing = true;
    onLoadingChange(true);

    while (queue.length > 0) {
      const task = queue.shift()!;
      await task();
    }

    processing = false;
    onLoadingChange(false);
  }

  /** 新增請求到佇列中，等待輪到他執行，並執行完畢後，回傳結果 */
  function add<T>(requestFn: () => Promise<T>): Promise<T> {
    const { promise, resolve, reject } = defer<T>();

    queue.push(async () => {
      const { data, error } = await tryCatch(requestFn);
      if (error) reject(error);
      else resolve(data);
    });

    processQueue();

    return promise;
  }

  return { add };
}

const loadingStore = create<{ loading: boolean }>(() => ({
  loading: true,
}));

const requestQueue = createRequestQueue((loading) => {
  loadingStore.setState({ loading });
});

export { requestQueue, loadingStore };
