import { fileSystemDataStore } from "./data";
import { setPage, clearSelection } from "./view";
import { requestFileSystemHost } from "./message";

/**
 * 重新整理
 */
const refresh = async () => {
  const { currentPath, panelId } = fileSystemDataStore.getState();
  const result = await requestFileSystemHost({ panelId, type: "readDirectory", params: { dirPath: currentPath } });
  fileSystemDataStore.setState({ ...result });
};

/**
 * 請求切換資料夾
 */
const navigateToFolder = async (folderPath: string) => {
  clearSelection();
  const { panelId } = fileSystemDataStore.getState();
  const result = await requestFileSystemHost({ panelId, type: "readDirectory", params: { dirPath: folderPath } });
  fileSystemDataStore.setState({ ...result });
  setPage(1);
};

/**
 * 透過麵包屑導航
 */
const navigateToBreadcrumb = (index: number) => {
  const { currentPathParts } = fileSystemDataStore.getState();
  const parts = currentPathParts.slice(0, index + 1);

  // 特殊處理：如果只有磁碟機代號（如 'C:'），需要加上斜線變成 'C:/'
  const targetPath = parts.length === 1 && /^[A-Za-z]:$/.test(parts[0]) ? parts[0] + "/" : parts.join("/");
  navigateToFolder(targetPath);
};

/**
 * 往上一層資料夾
 */
const navigateUp = () => {
  const { isCurrentRoot, currentPathParts } = fileSystemDataStore.getState();
  if (isCurrentRoot) return; // 已經在根目錄
  navigateToBreadcrumb(currentPathParts.length - 2);
};

export { refresh, navigateToFolder, navigateUp, navigateToBreadcrumb };
