import { fileSystemDataStore } from "./data";
import { requestQueue } from "./queue";
import { invoke } from "@/utils/message_client";
import type { OpenFileAPI, CreateDirAPI, CreateFileAPI, OpenInTargetAPI } from "@/providers/fileSystemProvider";

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

export { openFile, createNewFolder, createNewFile, openInWorkspace, openInTerminal, openInImageWall };
