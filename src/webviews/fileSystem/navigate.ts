import { fileSystemDataStore } from "./data";
import { postMessageToExtension } from "../utils/vscodeApi";
import type { FileSystemRequest } from "../../providers/fileSystemProvider";

const postMessage = (params: FileSystemRequest) => postMessageToExtension(params);

/** 請求切換頁碼 */
const navigateToPage = (page: number) => {
  const { panelId, folderPath, sortField, sortOrder } = fileSystemDataStore.getState();
  postMessage({ type: "request", panelId, folderPath, page, sortField, sortOrder });
};

/** 請求切換資料夾 */
const navigateToFolder = (folderPath: string) => {
  const { panelId, sortField, sortOrder } = fileSystemDataStore.getState();
  postMessage({ type: "request", panelId, folderPath, page: 1, sortField, sortOrder });
};

/** 透過麵包屑導航 */
const navigateToBreadcrumb = (index: number) => {
  const { folderPathParts } = fileSystemDataStore.getState();
  const parts = folderPathParts.slice(0, index + 1);

  // 特殊處理：如果只有磁碟機代號（如 'C:'），需要加上斜線變成 'C:/'
  const targetPath = parts.length === 1 && /^[A-Za-z]:$/.test(parts[0]) ? parts[0] + "/" : parts.join("/");
  navigateToFolder(targetPath);
};

/** 往上一層資料夾 */
const navigateUp = () => {
  const { root } = fileSystemDataStore.getState();
  if (root) return; // 已經在根目錄
  navigateToBreadcrumb(fileSystemDataStore.getState().folderPathParts.length - 2);
};

/** 開啟檔案 */
const navigateToFile = (filePath: string) => {
  postMessageToExtension({ type: "openFile", filePath });
};

export { navigateToPage, navigateToFolder, navigateUp, navigateToBreadcrumb, navigateToFile };
