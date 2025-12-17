import { create } from "zustand";
import { getInitialData, invoke } from "@/utils/message_client";
import type { ShowInfoAPI } from "@/providers/fileSystemProvider";
import type { FileSystemInitialData } from "@/providers/fileSystemProvider";

const initialData = getInitialData<FileSystemInitialData>();
if (!initialData) {
  invoke<ShowInfoAPI>("showInformationMessage", { message: "無法取得檔案系統初始資料" });
  throw new Error("無法取得檔案系統初始資料");
}

/**
 * 建立前端用於儲存檔案系統資料的容器
 */
const fileSystemDataStore = create<FileSystemInitialData>(() => ({
  ...initialData,
}));

export { fileSystemDataStore };
