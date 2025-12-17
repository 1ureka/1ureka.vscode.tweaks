import { invoke } from "@/utils/message_client";
import type { OpenFileAPI, CreateDirAPI, CreateFileAPI } from "@/providers/fileSystemProvider";
import type { DeleteAPI } from "@/providers/fileSystemProvider";

import { fileSystemViewDataStore } from "@@/fileSystem/store/view";
import { fileSystemDataStore } from "@@/fileSystem/store/data";
import { requestQueue } from "@@/fileSystem/store/queue";

/** 刪除選取的項目 */
const deleteItems = async () => {
  const { selected, entries } = fileSystemViewDataStore.getState();
  const { currentPath } = fileSystemDataStore.getState();

  const itemList = entries.filter((_, index) => Boolean(selected[index])).map((entry) => entry.fileName);

  const result = await requestQueue.add(() => invoke<DeleteAPI>("delete", { itemList, dirPath: currentPath }));
  fileSystemDataStore.setState({ ...result });
};

/** 開啟檔案 */
const openFile = (filePath: string) => {
  invoke<OpenFileAPI>("openFile", { filePath });
};

/** 建立新資料夾 */
const createNewFolder = async () => {
  const { currentPath } = fileSystemDataStore.getState();

  const result = await requestQueue.add(() => invoke<CreateDirAPI>("createDir", { dirPath: currentPath }));
  if (!result) return;

  fileSystemDataStore.setState({ ...result });
};

/** 建立新檔案 */
const createNewFile = async () => {
  const { currentPath } = fileSystemDataStore.getState();

  const result = await requestQueue.add(() => invoke<CreateFileAPI>("createFile", { dirPath: currentPath }));
  if (!result) return;

  fileSystemDataStore.setState({ ...result });
};

export { openFile, createNewFolder, createNewFile, deleteItems };
