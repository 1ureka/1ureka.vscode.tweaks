import { invoke } from "@@/fileSystem/store/init";
import { dataStore } from "@@/fileSystem/store/data";
import { requestQueue } from "@@/fileSystem/store/queue";

/**
 * 請求切換資料夾
 */
const navigateToFolder = async ({ dirPath }: { dirPath: string }) => {
  const result = await requestQueue.add(() => invoke("system.read.dir", { dirPath }));
  dataStore.setState({ ...result });
};

/**
 * 重新整理
 */
const refresh = async () => {
  const { currentPath } = dataStore.getState();
  const result = await requestQueue.add(() => invoke("system.read.dir", { dirPath: currentPath }));
  dataStore.setState({ ...result });
};

/**
 * 往上一層資料夾
 */
const navigateUp = async () => {
  const { isCurrentRoot, currentPath } = dataStore.getState();
  if (isCurrentRoot) return; // 已經在根目錄
  const result = await requestQueue.add(() => invoke("system.read.dir", { dirPath: currentPath, depthOffset: 1 }));
  dataStore.setState({ ...result });
};

/**
 * 以該資料夾開啟新的環境 (比如工作區、終端機等)
 */
const openInEnvironment = (target: "workspace" | "terminal" | "imageWall") => {
  const { currentPath } = dataStore.getState();
  invoke("system.open.dir", { target, dirPath: currentPath });
};

export { navigateToFolder, refresh, navigateUp, openInEnvironment };
