import { fileSystemDataStore } from "./data";
import { postMessageToExtension } from "../utils/vscodeApi";
import type { FileSystemDialogMessage } from "../../providers/fileSystemProvider";

const postMessage = (params: FileSystemDialogMessage) => postMessageToExtension(params);

/** 建立新資料夾 */
const createNewFolder = () => {
  postMessage({ type: "openDialog", dialogType: "newFolder", ...fileSystemDataStore.getState() });
};

/** 建立新檔案 */
const createNewFile = () => {
  postMessage({ type: "openDialog", dialogType: "newFile", ...fileSystemDataStore.getState() });
};

export { createNewFolder, createNewFile };
