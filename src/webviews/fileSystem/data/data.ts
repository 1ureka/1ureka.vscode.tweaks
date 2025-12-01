import { create } from "zustand";
import { getInitialData } from "@/utils/message_client";
import { requestFileSystemHost } from "./message";
import type { FileSystemInitialData } from "@/providers/fileSystemProvider";

// ------------------------------------------------------------------------------------------
// 建立前端用於儲存檔案系統資料的容器
// ------------------------------------------------------------------------------------------

const initialData = getInitialData<FileSystemInitialData>();
if (!initialData) throw new Error("無法取得檔案系統初始資料");

const fileSystemDataStore = create<FileSystemInitialData & { loading: boolean }>(() => ({
  ...initialData,
  loading: true,
}));

/** 初始化 */
const registerDataInitEvent = async () => {
  const result = await requestFileSystemHost({
    panelId: initialData.panelId,
    type: "readDirectory",
    params: { dirPath: initialData.currentPath },
  });

  fileSystemDataStore.setState({ ...result });
};

export { fileSystemDataStore, registerDataInitEvent };
