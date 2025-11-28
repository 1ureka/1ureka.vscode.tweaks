import { fileSystemDataStore } from "./data";
import { postMessageToExtension } from "../utils/vscodeApi";
import type { FileSystemRequest } from "../../providers/fileSystemProvider";

const postMessage = (params: FileSystemRequest) => postMessageToExtension(params);

/** 重新整理 */
const refresh = () => {
  postMessage({ type: "request", ...fileSystemDataStore.getState() });
};

/** 請求切換頁碼 */
const navigateToPage = (page: number) => {
  postMessage({ type: "request", ...fileSystemDataStore.getState(), page });
};

/** 請求切換資料夾 */
const navigateToFolder = (folderPath: string) => {
  postMessage({ type: "request", ...fileSystemDataStore.getState(), folderPath, page: 1 });
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

/** 設定排序欄位與順序 */
const setSorting = (field: FileSystemRequest["sortField"]) => {
  const { sortField, sortOrder } = fileSystemDataStore.getState();
  // 如果點擊的是同一欄位，切換順序；否則使用預設升序
  const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";

  postMessage({ type: "request", ...fileSystemDataStore.getState(), sortField: field, sortOrder: newOrder });
};

export { refresh, setSorting };
export { navigateToPage, navigateToFolder, navigateUp, navigateToBreadcrumb, navigateToFile };
