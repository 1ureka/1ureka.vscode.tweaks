import { invoke } from "@explorer/store/init";
import { dataStore, navigationStore, navigateHistoryStore, navigationExternalStore } from "@explorer/store/data";
import { requestQueue } from "@explorer/store/queue";

/**
 * 重新整理
 */
const refresh = async () => {
  const { currentPath, mode } = dataStore.getState();

  if (mode === "directory") {
    const result = await requestQueue.add(() => invoke("system.read.dir", { dirPath: currentPath }));
    dataStore.setState({ ...result });
  } else if (mode === "images") {
    const result = await requestQueue.add(() => invoke("system.read.images", { dirPath: currentPath }));
    dataStore.setState({ ...result });
  }
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
const openInEnvironment = (target: "workspace" | "terminal") => {
  const { currentPath } = dataStore.getState();
  invoke("system.open.dir", { target, dirPath: currentPath });
};

/**
 * 獲取/更新磁碟機列表
 */
const readDrives = async () => {
  const drives = await invoke("system.read.volumes", undefined);
  navigationExternalStore.setState({ systemDrives: drives });
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
 * 請求切換到資料夾，以圖片布局模式顯示，對於歷史紀錄則當作普通資料夾檢視 (不記住是來自圖片模式)
 */
const navigateToImages = async ({ dirPath }: { dirPath: string }) => {
  const result = await requestQueue.add(() => invoke("system.read.images", { dirPath }));

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
  const { mode } = dataStore.getState();
  const { destPath } = navigationStore.getState();

  if (mode === "directory") {
    return navigateToFolder({ dirPath: destPath });
  } else if (mode === "images") {
    return navigateToImages({ dirPath: destPath });
  }
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

/**
 * 前往目前資料夾的圖片網格檢視
 */
const navigateToImageGridView = () => {
  const { currentPath } = dataStore.getState();

  return navigateToImages({ dirPath: currentPath });
};

export { stageDestinationPath, openInEnvironment, refresh, readDrives, navigateToImageGridView };
export { navigateGotoFolder, navigateToFolder, navigateUp, navigateToPreviousFolder, navigateToNextFolder };
