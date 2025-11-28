import { create } from "zustand";
import { postMessageToExtension, getInitialData } from "../../utils/vscodeApi";
import type { FileSystemData } from "../../../handlers/fileSystemHandlers";

const initialData = getInitialData<FileSystemData>();
if (!initialData) {
  postMessageToExtension({ type: "info", message: "無法取得檔案系統初始資料" });
  throw new Error("無法取得檔案系統初始資料");
}

const fileSystemDataStore = create<FileSystemData>(() => ({ ...initialData }));

/** 註冊後端資料更新事件 */
const registerDataChangeEvent = () => {
  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "fileSystemData") {
      const { data } = event.data as { type: "fileSystemData"; data: FileSystemData };
      fileSystemDataStore.setState(data);
    }
  });
};

export { fileSystemDataStore, registerDataChangeEvent };
