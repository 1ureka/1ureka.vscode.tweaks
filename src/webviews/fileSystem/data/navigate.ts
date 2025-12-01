import { fileSystemDataStore } from "./data";
import { requestQueue } from "./queue";
import { invoke } from "@/utils/message_client";
import type { ReadDirAPI } from "@/providers/fileSystemProvider";

/**
 * 重新整理
 */
const refresh = () => {
  const { currentPath } = fileSystemDataStore.getState();
  navigateToFolder({ dirPath: currentPath });
};

/**
 * 請求切換資料夾
 */
const navigateToFolder = async ({ dirPath }: { dirPath: string }) => {
  const result = await requestQueue.add(() => invoke<ReadDirAPI>("readDirectory", { dirPath }));
  fileSystemDataStore.setState({ ...result });
};

/**
 * 透過麵包屑導航
 */
const navigateToBreadcrumb = (index: number) => {
  const { currentPathParts } = fileSystemDataStore.getState();
  const parts = currentPathParts.slice(0, index + 1);

  // 特殊處理：如果只有磁碟機代號（如 'C:'），需要加上斜線變成 'C:/'
  const targetPath = parts.length === 1 && /^[A-Za-z]:$/.test(parts[0]) ? parts[0] + "/" : parts.join("/");
  navigateToFolder({ dirPath: targetPath });
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
