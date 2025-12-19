import type { ReadDirAPI } from "@/providers/fileSystemProvider";
import { invoke } from "@/utils/message_client";
import { dataStore } from "@@/fileSystem/store/data";
import { requestQueue } from "@@/fileSystem/store/queue";

/**
 * 初始化，利用注入的初始資料，來獲取完整資料
 */
const readInitData = async () => {
  const initialData = dataStore.getState();

  const result = await requestQueue.add(() =>
    invoke<ReadDirAPI>("readDirectory", { dirPath: initialData.currentPath })
  );

  dataStore.setState({ ...result });
};

export { readInitData };
