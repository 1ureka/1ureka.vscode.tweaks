import { fileSystemDataStore } from "./data";
import { fileSystemViewDataStore, fileSystemViewStore, type ViewStateStore } from "./view";
import { requestQueue } from "./queue";
import { invoke } from "@/utils/message_client";
import type { OpenFileAPI, CreateDirAPI, CreateFileAPI, OpenInTargetAPI } from "@/providers/fileSystemProvider";
import type { DeleteAPI, RenameAPI, ShowInfoAPI } from "@/providers/fileSystemProvider";

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

/** 開始重命名最後選定的 row */
const startRenaming = () => {
  const { lastSelectedIndex } = fileSystemViewDataStore.getState();

  if (lastSelectedIndex !== null) {
    fileSystemViewDataStore.setState({ renamingIndex: lastSelectedIndex });
  } else {
    invoke<ShowInfoAPI>("showInformationMessage", { message: "請先選擇一個檔案或資料夾進行重新命名。" });
  }
};

/** 結束重命名，比如在失去焦點時呼叫 */
const endRenaming = async ({ name, newName }: { name: string; newName: string }) => {
  fileSystemViewDataStore.setState({ renamingIndex: null });

  if (name === newName) return;

  const { currentPath } = fileSystemDataStore.getState();

  const result = await requestQueue.add(() => invoke<RenameAPI>("rename", { name, newName, dirPath: currentPath }));
  fileSystemDataStore.setState({ ...result });
};

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

export { setSorting, setFilter, startRenaming, endRenaming, deleteItems };
export { openFile, createNewFolder, createNewFile, openInWorkspace, openInTerminal, openInImageWall };
