import { fileSystemDataStore } from "./data";
import { requestFileSystemHost } from "./message";

/** 開啟檔案 */
const openFile = (filePath: string) => {
  const { panelId } = fileSystemDataStore.getState();
  requestFileSystemHost({ panelId, type: "openFile", params: { filePath } });
};

/** 建立新資料夾 */
const createNewFolder = () => {
  const { currentPath, panelId } = fileSystemDataStore.getState();
  requestFileSystemHost({ panelId, type: "createDir", params: { dirPath: currentPath } });
};

/** 建立新檔案 */
const createNewFile = () => {
  const { currentPath, panelId } = fileSystemDataStore.getState();
  requestFileSystemHost({ panelId, type: "createFile", params: { dirPath: currentPath } });
};

/** 以該資料夾開啟工作區 */
const openInWorkspace = () => {
  const { currentPath, panelId } = fileSystemDataStore.getState();
  requestFileSystemHost({ panelId, type: "openInTarget", params: { target: "workspace", dirPath: currentPath } });
};

/** 以該資料夾開啟終端機 */
const openInTerminal = () => {
  const { currentPath, panelId } = fileSystemDataStore.getState();
  requestFileSystemHost({ panelId, type: "openInTarget", params: { target: "terminal", dirPath: currentPath } });
};

/** 以該資料夾開啟圖片牆 */
const openInImageWall = () => {
  const { currentPath, panelId } = fileSystemDataStore.getState();
  requestFileSystemHost({ panelId, type: "openInTarget", params: { target: "imageWall", dirPath: currentPath } });
};

export { openFile, createNewFolder, createNewFile, openInWorkspace, openInTerminal, openInImageWall };
