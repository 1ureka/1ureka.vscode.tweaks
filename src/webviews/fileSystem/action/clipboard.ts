import type { PasteAPI, SetSystemClipboardAPI } from "@/providers/fileSystemProvider";
import { invoke } from "@/utils/message_client";
import { fileSystemDataStore } from "@@/fileSystem/store/data";
import { fileSystemClipboardStore, type FileSystemClipboard } from "@@/fileSystem/store/other";
import { fileSystemViewDataStore } from "@@/fileSystem/store/view";
import { requestQueue } from "@@/fileSystem/store/queue";

/**
 * 將目前選取的檔案寫入到剪貼簿，會覆蓋先前的內容
 */
const setClipboard = () => {
  const selected = fileSystemViewDataStore.getState().selected;
  const files = fileSystemViewDataStore.getState().entries;

  const fileList = files.filter((_, index) => {
    const isSelected = selected[index];
    return Boolean(isSelected);
  });

  const clipboardEntries: FileSystemClipboard["entries"] = {};
  fileList.forEach((entry) => {
    clipboardEntries[entry.filePath] = { ...entry };
  });

  fileSystemClipboardStore.setState({ entries: clipboardEntries });
};

/**
 * 獲取剪貼簿中的項目 (給 react 外部使用)
 */
const getClipboardList = () => {
  const entries = fileSystemClipboardStore.getState().entries;
  return Object.values(entries);
};

/**
 * 將剪貼簿中的項目貼上到目前資料夾，透過呼叫 Paste API
 */
const invokeClipboardPaste = async () => {
  const clipboardList = getClipboardList();
  if (clipboardList.length === 0) return;

  const srcList = clipboardList.map((entry) => entry.filePath);
  const destDir = fileSystemDataStore.getState().currentPath;

  const result = await requestQueue.add(() => invoke<PasteAPI>("paste", { srcList, destDir }));
  if (!result) return;

  fileSystemClipboardStore.setState({ entries: {} });
  fileSystemDataStore.setState({ ...result });
};

/**
 * 將選擇中的項目的路徑寫入系統剪貼簿
 */
const handleCopyToSystem = ({ mode }: { mode: "paths" | "names" }) => {
  const selected = fileSystemViewDataStore.getState().selected;
  const files = fileSystemViewDataStore.getState().entries;
  const fileList = files.filter((_, index) => Boolean(selected[index]));

  if (fileList.length === 0) return;

  if (mode === "names") {
    const names = fileList.map(({ fileName }) => fileName).join("\n");
    return invoke<SetSystemClipboardAPI>("setSystemClipboard", { text: names });
  } else if (mode === "paths") {
    const paths = fileList.map(({ filePath }) => filePath).join("\n");
    return invoke<SetSystemClipboardAPI>("setSystemClipboard", { text: paths });
  }
};

export { setClipboard, invokeClipboardPaste, handleCopyToSystem };
