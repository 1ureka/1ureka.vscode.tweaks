import { fileSystemDataStore } from "./data";
import { requestQueue } from "./queue";
import { invoke } from "@/utils/message_client";
import type { ReadDirAPI, GotoPathAPI } from "@/providers/fileSystemProvider";

/**
 * 請求切換資料夾
 */
const navigateToFolder = async ({ dirPath }: { dirPath: string }) => {
  const result = await requestQueue.add(() => invoke<ReadDirAPI>("readDirectory", { dirPath }));
  fileSystemDataStore.setState({ ...result });
};

/**
 * 重新整理
 */
const refresh = async () => {
  const { currentPath } = fileSystemDataStore.getState();
  const result = await requestQueue.add(() => invoke<ReadDirAPI>("readDirectory", { dirPath: currentPath }));
  fileSystemDataStore.setState({ ...result });
};

/**
 * 透過麵包屑導航，其中 index 是點擊的麵包屑項目的從 0 開始的索引
 */
const navigateToBreadcrumb = async (index: number) => {
  const { currentPathParts, currentPath } = fileSystemDataStore.getState();
  const depthOffset = currentPathParts.length - 1 - index;
  const result = await requestQueue.add(() =>
    invoke<ReadDirAPI>("readDirectory", { dirPath: currentPath, depthOffset })
  );
  fileSystemDataStore.setState({ ...result });
};

/**
 * 往上一層資料夾
 */
const navigateUp = async () => {
  const { isCurrentRoot, currentPath } = fileSystemDataStore.getState();
  if (isCurrentRoot) return; // 已經在根目錄
  const result = await requestQueue.add(() =>
    invoke<ReadDirAPI>("readDirectory", { dirPath: currentPath, depthOffset: 1 })
  );
  fileSystemDataStore.setState({ ...result });
};

/**
 * 前往指定路徑 (Go to...)
 */
const navigateToPath = async () => {
  const dirPath = fileSystemDataStore.getState().currentPath;
  const result = await requestQueue.add(() => invoke<GotoPathAPI>("gotoPath", { dirPath }));
  if (result) fileSystemDataStore.setState({ ...result });
};

/**
 * 註冊有關導航的快捷鍵
 */
const registerNavigateShortcuts = () => {
  window.addEventListener(
    "keydown",
    (e) => {
      // Ctrl + R 或 Cmd + R：重新整理
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") {
        e.preventDefault();
        e.stopPropagation();
        refresh();
      }

      // Crtl + G 或 Cmd + G：前往指定目錄
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "g") {
        e.preventDefault();
        e.stopPropagation();
        navigateToPath();
      }
    },
    true
  );
};

export { navigateToPath, navigateToFolder, navigateUp, navigateToBreadcrumb };
export { refresh, registerNavigateShortcuts };
