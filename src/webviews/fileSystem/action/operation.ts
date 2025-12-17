import type { OpenFileAPI, CreateDirAPI, CreateFileAPI, DeleteAPI } from "@/providers/fileSystemProvider";
import { invoke } from "@/utils/message_client";
import { dataStore, selectionStore, viewDataStore } from "@@/fileSystem/store/data";
import { requestQueue } from "@@/fileSystem/store/queue";

/** 刪除選取的項目 */
const deleteItems = async () => {
  const { selected } = selectionStore.getState();
  const { entries } = viewDataStore.getState();
  const { currentPath } = dataStore.getState();

  const itemList = entries.filter((_, index) => Boolean(selected[index])).map((entry) => entry.fileName);

  const result = await requestQueue.add(() => invoke<DeleteAPI>("delete", { itemList, dirPath: currentPath }));
  dataStore.setState({ ...result });
};

/** 開啟檔案 */
const openFile = (filePath: string) => {
  invoke<OpenFileAPI>("openFile", { filePath });
};

/** 建立新資料夾 */
const createNewFolder = async () => {
  const { currentPath } = dataStore.getState();

  const result = await requestQueue.add(() => invoke<CreateDirAPI>("createDir", { dirPath: currentPath }));
  if (!result) return;

  dataStore.setState({ ...result });
};

/** 建立新檔案 */
const createNewFile = async () => {
  const { currentPath } = dataStore.getState();

  const result = await requestQueue.add(() => invoke<CreateFileAPI>("createFile", { dirPath: currentPath }));
  if (!result) return;

  dataStore.setState({ ...result });
};

export { openFile, createNewFolder, createNewFile, deleteItems };
