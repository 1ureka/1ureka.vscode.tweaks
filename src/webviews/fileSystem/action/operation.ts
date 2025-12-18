import type { OpenFileAPI, CreateDirAPI, CreateFileAPI, DeleteAPI } from "@/providers/fileSystemProvider";
import { invoke } from "@/utils/message_client";
import { dataStore, selectionStore, viewDataStore } from "@@/fileSystem/store/data";
import { requestQueue } from "@@/fileSystem/store/queue";

/**
 * 刪除選取的項目
 */
const deleteItems = async () => {
  const { selected } = selectionStore.getState();
  const { entries } = viewDataStore.getState();
  const { currentPath } = dataStore.getState();

  const itemList = entries.filter((_, index) => Boolean(selected[index])).map((entry) => entry.fileName);

  const result = await requestQueue.add(() => invoke<DeleteAPI>("delete", { itemList, dirPath: currentPath }));
  dataStore.setState({ ...result });
};

/**
 * 開啟檔案
 */
const openFile = (filePath: string) => {
  invoke<OpenFileAPI>("openFile", { filePath });
};

/**
 * 建立新資料夾
 */
const createNewFolder = async () => {
  const { currentPath } = dataStore.getState();

  const result = await requestQueue.add(() => invoke<CreateDirAPI>("createDir", { dirPath: currentPath }));
  if (!result) return;

  dataStore.setState({ ...result });
};

/**
 * 建立新檔案
 */
const createNewFile = async () => {
  const { currentPath } = dataStore.getState();

  const result = await requestQueue.add(() => invoke<CreateFileAPI>("createFile", { dirPath: currentPath }));
  if (!result) return;

  dataStore.setState({ ...result });
};

/**
 * 處理拖曳檔案到外部，目前支援作業系統檔案總管與 VSCode
 */
const startFileDrag = ({ e, filePath, fileName }: { e: DragEvent; filePath: string; fileName: string }) => {
  if (!e.dataTransfer) return;

  const fileUrl = `file:///${filePath.replace(/\\/g, "/")}`;
  const mimeType = "application/octet-stream";
  const downloadURL = `${mimeType}:${fileName}:${fileUrl}`;

  e.dataTransfer.setData("DownloadURL", downloadURL);
  e.dataTransfer.setData("text/uri-list", fileUrl);
  e.dataTransfer.setData("application/vnd.code.uri-list", JSON.stringify([fileUrl]));
  e.dataTransfer.setData("codefiles", JSON.stringify([filePath]));
  e.dataTransfer.setData("resourceurls", JSON.stringify([fileUrl]));
  e.dataTransfer.effectAllowed = "copy";
};

export { openFile, createNewFolder, createNewFile, deleteItems, startFileDrag };
