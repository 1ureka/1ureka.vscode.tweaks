import { invoke } from "@/utils/message_client";
import type { OpenInTargetAPI, ReadDirAPI } from "@/providers/fileSystemProvider";

import { fileSystemDataStore } from "@@/fileSystem/store/data";
import { requestQueue } from "@@/fileSystem/store/queue";

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
 * 以該資料夾開啟工作區
 */
const openInWorkspace = () => {
  const { currentPath } = fileSystemDataStore.getState();
  invoke<OpenInTargetAPI>("openInTarget", { target: "workspace", dirPath: currentPath });
};

/**
 * 以該資料夾開啟終端機
 */
const openInTerminal = () => {
  const { currentPath } = fileSystemDataStore.getState();
  invoke<OpenInTargetAPI>("openInTarget", { target: "terminal", dirPath: currentPath });
};

/**
 * 以該資料夾開啟圖片牆
 */
const openInImageWall = () => {
  const { currentPath } = fileSystemDataStore.getState();
  invoke<OpenInTargetAPI>("openInTarget", { target: "imageWall", dirPath: currentPath });
};

export { navigateToFolder, refresh, navigateUp };
export { openInWorkspace, openInTerminal, openInImageWall };
