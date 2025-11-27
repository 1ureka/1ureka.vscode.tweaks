import { create } from "zustand";
import { postMessageToExtension, getInitialData } from "../utils/vscodeApi";
import type { FileSystemData } from "../../handlers/fileSystemHandlers";

const initialData = getInitialData<FileSystemData>();
if (!initialData) {
  postMessageToExtension({ type: "info", message: "無法取得檔案系統初始資料" });
  throw new Error("無法取得檔案系統初始資料");
}

const fileSystemDataStore = create<FileSystemData>(() => ({ ...initialData }));

/** 請求切換頁碼 */
const navigateToPage = (page: number) => {
  const { panelId, folderPath } = fileSystemDataStore.getState();
  postMessageToExtension({ type: "request", panelId, folderPath, page });
};

/** 請求切換資料夾 */
const navigateToFolder = (folderPath: string) => {
  const { panelId } = fileSystemDataStore.getState();
  postMessageToExtension({ type: "request", panelId, folderPath, page: 1 });
};

/** 往上一層資料夾 */
const navigateUp = () => {
  const { folderPath, root } = fileSystemDataStore.getState();
  if (root) return; // 已經在根目錄

  const parentPath = folderPath.split(/[/\\]/).slice(0, -1).join("/");
  navigateToFolder(parentPath);
};

/** 透過麵包屑導航 */
const navigateToBreadcrumb = (index: number) => {
  const { folderPathParts } = fileSystemDataStore.getState();
  const parts = folderPathParts.slice(0, index + 1);

  // 特殊處理：如果只有磁碟機代號（如 'C:'），需要加上斜線變成 'C:/'
  const targetPath = parts.length === 1 && /^[A-Za-z]:$/.test(parts[0]) ? parts[0] + "/" : parts.join("/");

  navigateToFolder(targetPath);
};

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
export { navigateToPage, navigateToFolder, navigateUp, navigateToBreadcrumb };
