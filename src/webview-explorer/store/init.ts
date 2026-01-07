import type { ExplorerAPI } from "@/feature-explorer/provider";
import { createInvoke } from "@/utils-vscode/message/client";
import { dataStore, navigationExternalStore } from "@explorer/store/data";
import { requestQueue } from "@explorer/store/queue";

/**
 * 建立用於調用延伸主機 API 的函式
 */
const { invoke } = createInvoke<ExplorerAPI>();

/**
 * 初始化，利用注入的初始資料，來獲取完整資料
 */
const readInitData = async () => {
  invoke("system.read.system.folders", undefined).then((folders) => {
    navigationExternalStore.setState({ systemFolders: folders });
  });
  invoke("system.read.volumes", undefined).then((drives) => {
    navigationExternalStore.setState({ systemDrives: drives });
  });

  const initialData = dataStore.getState();
  const result = await requestQueue.add(() => invoke("system.read.dir", { dirPath: initialData.currentPath }));
  dataStore.setState({ ...result });
};

export { readInitData, invoke };
