import { create } from "zustand";
import { fileSystemViewDataStore } from "./view";
import type { InspectDirectoryEntry } from "@/utils/system";

type FileSystemClipboard = {
  entries: { [filePath: string]: { entry: InspectDirectoryEntry; type: "copy" | "cut" } };
};

const fileSystemClipboardStore = create<FileSystemClipboard>(() => ({
  entries: {},
}));

/** 將目前選取的檔案設定到剪貼簿，會覆蓋先前的內容 */
const setClipboard = ({ type }: { type: "copy" | "cut" }) => {
  const selected = fileSystemViewDataStore.getState().selected;
  const files = fileSystemViewDataStore.getState().entries;

  const fileList = files.filter((_, index) => {
    const isSelected = selected[index];
    return Boolean(isSelected);
  });

  const clipboardEntries: FileSystemClipboard["entries"] = {};
  fileList.forEach((entry) => {
    clipboardEntries[entry.filePath] = { entry, type };
  });

  fileSystemClipboardStore.setState({ entries: clipboardEntries });
};

/** 清空剪貼簿 */
const clearClipboard = () => {
  fileSystemClipboardStore.setState({ entries: {} });
};

/** 獲取剪貼簿中的項目 (給 react 外部使用) */
const getClipboardList = () => {
  const entries = fileSystemClipboardStore.getState().entries;
  return Object.values(entries).map(({ entry, type }) => ({ entry, type }));
};

/** 一個 filePath 是否在剪貼簿中的 hook */
const useIsInClipboard = (filePath: string): "copy" | "cut" | false => {
  const entries = fileSystemClipboardStore((state) => state.entries);
  return entries[filePath]?.type ?? false;
};

/** 目前剪貼簿中有的項目數量的 hook */
const useClipboardCount = () => {
  const entries = fileSystemClipboardStore((state) => state.entries);
  return Object.keys(entries).length;
};

export { setClipboard, clearClipboard, getClipboardList, useIsInClipboard, useClipboardCount };

/** 註冊剪貼簿事件 */
const registerClipboardEvents = () => {
  window.addEventListener("copy", () => setClipboard({ type: "copy" }));
  window.addEventListener("cut", () => setClipboard({ type: "cut" }));

  window.addEventListener("paste", () => {
    // TODO: 這裡會將資訊整理後 invoke 給 vscode 擴展主機端，讓其用 nodeJS 執行實際的檔案複製/移動
    // const clipboardList = getClipboardList();
  });
};

export { registerClipboardEvents };
