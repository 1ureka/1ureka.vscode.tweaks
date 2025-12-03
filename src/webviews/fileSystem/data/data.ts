import { create } from "zustand";
import { requestQueue } from "./queue";
import { getInitialData, invoke } from "@/utils/message_client";

import type { ShowInfoAPI, ReadDirAPI } from "@/providers/fileSystemProvider";
import type { FileSystemInitialData } from "@/providers/fileSystemProvider";

// ------------------------------------------------------------------------------------------
// 建立前端用於儲存檔案系統資料的容器
// ------------------------------------------------------------------------------------------

const initialData = getInitialData<FileSystemInitialData>();
if (!initialData) {
  invoke<ShowInfoAPI>("showInformationMessage", { message: "無法取得檔案系統初始資料" });
  throw new Error("無法取得檔案系統初始資料");
}

const fileSystemDataStore = create<FileSystemInitialData>(() => ({
  ...initialData,
}));

/** 初始化 */
const registerInitData = async () => {
  const result = await requestQueue.add(() =>
    invoke<ReadDirAPI>("readDirectory", { dirPath: initialData.currentPath })
  );

  fileSystemDataStore.setState({ ...result });
};

export { fileSystemDataStore, registerInitData };
