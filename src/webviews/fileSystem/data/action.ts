import { fileSystemDataStore } from "./data";
import { postMessageToExtension } from "../../utils/vscodeApi";
import type { FileSystemDialogMessage, FileSystemOpenInMessage } from "../../../providers/fileSystemProvider";

const postDialogMessage = (params: FileSystemDialogMessage) => postMessageToExtension(params);

/** 建立新資料夾 */
const createNewFolder = () => {
  postDialogMessage({ type: "openDialog", dialogType: "newFolder", ...fileSystemDataStore.getState() });
};

/** 建立新檔案 */
const createNewFile = () => {
  postDialogMessage({ type: "openDialog", dialogType: "newFile", ...fileSystemDataStore.getState() });
};

const postOpenInMessage = (params: FileSystemOpenInMessage) => postMessageToExtension(params);

/** 以該資料夾開啟工作區 */
const openInWorkspace = () => {
  postOpenInMessage({ type: "openIn", openType: "workspace", ...fileSystemDataStore.getState() });
};

/** 以該資料夾開啟終端機 */
const openInTerminal = () => {
  postOpenInMessage({ type: "openIn", openType: "terminal", ...fileSystemDataStore.getState() });
};

/** 以該資料夾開啟圖片牆 */
const openInImageWall = () => {
  postOpenInMessage({ type: "openIn", openType: "imageWall", ...fileSystemDataStore.getState() });
};

export { createNewFolder, createNewFile, openInWorkspace, openInTerminal, openInImageWall };
