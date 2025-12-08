import { create } from "zustand";
import { fileSystemDataStore } from "./data";
import { fileSystemViewDataStore } from "./view";
import { requestQueue } from "./queue";

import { invoke } from "@/utils/message_client";
import type { InspectDirectoryEntry } from "@/utils/system";
import type { SetSystemClipboardAPI, PasteAPI } from "@/providers/fileSystemProvider";
import { refresh } from "./navigate";

type FileSystemClipboard = {
  entries: { [filePath: string]: InspectDirectoryEntry };
};

const fileSystemClipboardStore = create<FileSystemClipboard>(() => ({
  entries: {},
}));

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

/**
 * 將剪貼簿中的項目貼上到目前資料夾，透過呼叫 Paste API
 */
const invokeClipboardPaste = async () => {
  const clipboardList = getClipboardList();
  if (clipboardList.length === 0) return;

  const srcList = clipboardList.map((entry) => entry.filePath);
  const destDir = fileSystemDataStore.getState().currentPath;

  await requestQueue.add(() => invoke<PasteAPI>("paste", { srcList, destDir }));
  fileSystemClipboardStore.setState({ entries: {} });
  await refresh();
};

export { setClipboard, getClipboardList, handleCopyToSystem, invokeClipboardPaste };

// ------------------------------------------------------------------------------

/**
 * 給定的 filePath 是否在剪貼簿中的 hook
 */
const useIsInClipboard = (filePath: string): boolean => {
  const entries = fileSystemClipboardStore((state) => state.entries);
  return filePath in entries;
};

/**
 * 目前剪貼簿中有的項目數量的 hook
 */
const useClipboardCount = () => {
  const entries = fileSystemClipboardStore((state) => state.entries);
  return Object.keys(entries).length;
};

export { useIsInClipboard, useClipboardCount };

// ------------------------------------------------------------------------------

/**
 * 註冊剪貼簿事件
 */
const registerClipboardEvents = () => {
  window.addEventListener("copy", setClipboard);
  window.addEventListener("cut", setClipboard);
  window.addEventListener("paste", invokeClipboardPaste);
};

export { registerClipboardEvents };
