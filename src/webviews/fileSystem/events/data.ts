import type { ReadDirAPI } from "@/providers/fileSystemProvider";
import { invoke } from "@/utils/message_client";
import { fileSystemDataStore } from "@@/fileSystem/store/data";
import { requestQueue } from "@@/fileSystem/store/queue";

/**
 * 初始化，利用注入的初始資料，來獲取完整資料
 */
const registerInitDataEvents = async () => {
  const initialData = fileSystemDataStore.getState();

  const result = await requestQueue.add(() =>
    invoke<ReadDirAPI>("readDirectory", { dirPath: initialData.currentPath })
  );

  fileSystemDataStore.setState({ ...result });
};

export { registerInitDataEvents };
