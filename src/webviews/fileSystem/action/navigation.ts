import { invoke } from "@@/fileSystem/store/init";
import { dataStore, navigationStore, navigateHistoryStore } from "@@/fileSystem/store/data";
import { requestQueue } from "@@/fileSystem/store/queue";

/**
 * 重新整理
 */
const refresh = async () => {
  const { currentPath } = dataStore.getState();
  const result = await requestQueue.add(() => invoke("system.read.dir", { dirPath: currentPath }));
  dataStore.setState({ ...result });
};

/**
 * 暫存使用者輸入的目標路徑
 */
const stageDestinationPath = (dirPath: string) => {
  navigationStore.setState({ destPath: dirPath });
};

/**
 * 以該資料夾開啟新的環境 (比如工作區、終端機等)
 */
const openInEnvironment = (target: "workspace" | "terminal" | "imageWall") => {
  const { currentPath } = dataStore.getState();
  invoke("system.open.dir", { target, dirPath: currentPath });
};

// ---------------------------------------------------------------------------

/**
 * 請求切換資料夾
 */
const navigateToFolder = async ({ dirPath, depthOffset }: { dirPath: string; depthOffset?: number }) => {
  const result = await requestQueue.add(() => invoke("system.read.dir", { dirPath, depthOffset }));

  const { history, currentIndex } = navigateHistoryStore.getState();
  if (history[currentIndex] !== result.currentPath) {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(result.currentPath);
    navigateHistoryStore.setState({ history: newHistory, currentIndex: newHistory.length - 1 });
  }

  dataStore.setState({ ...result });
};

/**
 * 正式根據使用者暫存的目標路徑切換資料夾
 */
const navigateGotoFolder = () => {
  const { destPath } = navigationStore.getState();
  return navigateToFolder({ dirPath: destPath });
};

/**
 * 往上一層資料夾
 */
const navigateUp = async () => {
  const { isCurrentRoot, currentPath } = dataStore.getState();
  if (isCurrentRoot) return; // 已經在根目錄
  return navigateToFolder({ dirPath: currentPath, depthOffset: -1 });
};

/**
 * 回到上一個瀏覽過的資料夾
 */
const navigateToPreviousFolder = async () => {
  const { history, currentIndex } = navigateHistoryStore.getState();
  if (currentIndex === 0) return; // 沒有上一個資料夾可回去

  const prevPath = history[currentIndex - 1];
  const result = await requestQueue.add(() => invoke("system.read.dir", { dirPath: prevPath }));

  navigateHistoryStore.setState({ history, currentIndex: currentIndex - 1 });

  dataStore.setState({ ...result });
};

/**
 * 前往下一個瀏覽過的資料夾
 */
const navigateToNextFolder = async () => {
  const { history, currentIndex } = navigateHistoryStore.getState();
  if (currentIndex >= history.length - 1) return; // 沒有下一個資料夾可前往

  const nextPath = history[currentIndex + 1];
  const result = await requestQueue.add(() => invoke("system.read.dir", { dirPath: nextPath }));

  navigateHistoryStore.setState({ history, currentIndex: currentIndex + 1 });

  dataStore.setState({ ...result });
};

export { stageDestinationPath, openInEnvironment, refresh };
export { navigateGotoFolder, navigateToFolder, navigateUp, navigateToPreviousFolder, navigateToNextFolder };
