import { fileSystemDataStore } from "./data";
import { fileSystemViewStore, type ViewStateStore } from "./view";
import { requestQueue } from "./queue";
import { invoke } from "@/utils/message_client";
import type { OpenFileAPI, CreateDirAPI, CreateFileAPI, OpenInTargetAPI } from "@/providers/fileSystemProvider";

/** 設定排序欄位與順序，如果點擊的是同一欄位，切換順序；否則使用預設升序 */
const setSorting = (field: ViewStateStore["sortField"]) => {
  const { sortField, sortOrder } = fileSystemViewStore.getState();
  const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
  fileSystemViewStore.setState({ sortField: field, sortOrder: newOrder });
};

/** 設定篩選條件 */
const setFilter = (filter: ViewStateStore["filter"]) => {
  fileSystemViewStore.setState({ filter });
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

/** 以該資料夾開啟工作區 */
const openInWorkspace = () => {
  const { currentPath } = fileSystemDataStore.getState();
  invoke<OpenInTargetAPI>("openInTarget", { target: "workspace", dirPath: currentPath });
};

/** 以該資料夾開啟終端機 */
const openInTerminal = () => {
  const { currentPath } = fileSystemDataStore.getState();
  invoke<OpenInTargetAPI>("openInTarget", { target: "terminal", dirPath: currentPath });
};

/** 以該資料夾開啟圖片牆 */
const openInImageWall = () => {
  const { currentPath } = fileSystemDataStore.getState();
  invoke<OpenInTargetAPI>("openInTarget", { target: "imageWall", dirPath: currentPath });
};

export { setSorting, setFilter };
export { openFile, createNewFolder, createNewFile, openInWorkspace, openInTerminal, openInImageWall };
