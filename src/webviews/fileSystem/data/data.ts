import { create } from "zustand";
import { postMessageToExtension, getInitialData } from "../../utils/vscodeApi";
import type { FileSystemInitialData, RequestFileSystemHost } from "../../../providers/fileSystemProvider";
import type { InspectDirectoryEntry } from "../../../utils/system";
import { tryCatch } from "../../../utils/tryCatch";
import { defer } from "../../../utils/promise";

// ------------------------------------------------------------------------------------------
// 建立前端用於儲存檔案系統資料的容器
// ------------------------------------------------------------------------------------------

const initialData = getInitialData<FileSystemInitialData>();
if (!initialData) {
  postMessageToExtension({ type: "info", message: "無法取得檔案系統初始資料" });
  throw new Error("無法取得檔案系統初始資料");
}

const fileSystemDataStore = create<FileSystemInitialData & { entries: InspectDirectoryEntry[]; loading: boolean }>(
  () => ({ ...initialData, entries: [], loading: true })
);

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

const requestQueue = createRequestQueue((loading) => {
  fileSystemDataStore.setState({ loading });
});

// ------------------------------------------------------------------------------------------
// 與 Extension 端進行通訊的函數實作
// ------------------------------------------------------------------------------------------

const requestFileSystemHost: RequestFileSystemHost = ({ panelId, type, params }) => {
  return requestQueue.add(() => {
    const { promise, resolve } = defer<any>();

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.panelId === panelId && event.data.type === type + "Result") {
        resolve(event.data.result);
      }
    };

    window.addEventListener("message", handleMessage, { once: true });
    postMessageToExtension({ panelId, type, params });

    return promise;
  });
};

/** 初始化 */
const registerDataInitEvent = async () => {
  const { entries } = await requestFileSystemHost({
    panelId: initialData.panelId,
    type: "readDirectory",
    params: { dirPath: initialData.currentPath },
  });

  fileSystemDataStore.setState({ entries });
};

export { fileSystemDataStore, registerDataInitEvent };
