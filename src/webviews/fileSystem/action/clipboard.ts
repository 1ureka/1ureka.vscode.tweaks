import type { PasteAPI, SetSystemClipboardAPI } from "@/providers/fileSystemProvider";
import type { InspectDirectoryEntry } from "@/utils/system";
import { invoke } from "@/utils/message_client";
import { clipboardStore, dataStore, selectionStore, viewDataStore } from "@@/fileSystem/store/data";
import { requestQueue } from "@@/fileSystem/store/queue";

/**
 * 將目前選取的檔案寫入到剪貼簿，會覆蓋先前的內容
 */
const setClipboard = () => {
  const { selected } = selectionStore.getState();
  const { entries } = viewDataStore.getState();

  const entriesToCopy = entries.filter((_, index) => {
    const isSelected = selected[index];
    return Boolean(isSelected);
  });

  const clipboardEntries: { [filePath: string]: InspectDirectoryEntry } = {};

  entriesToCopy.forEach((entry) => {
    clipboardEntries[entry.filePath] = { ...entry };
  });

  clipboardStore.setState({ entries: clipboardEntries });
};

/**
 * 獲取剪貼簿中的項目 (給 react 外部使用)
 */
const getClipboardList = () => {
  const { entries } = clipboardStore.getState();
  return Object.values(entries);
};

/**
 * 將剪貼簿中的項目貼上到目前資料夾，透過呼叫 Paste API
 */
const invokeClipboardPaste = async () => {
  const clipboardList = getClipboardList();
  if (clipboardList.length === 0) return;

  const srcList = clipboardList.map((entry) => entry.filePath);
  const { currentPath } = dataStore.getState();

  const result = await requestQueue.add(() => invoke<PasteAPI>("paste", { srcList, destDir: currentPath }));
  if (!result) return;

  clipboardStore.setState({ entries: {} });
  dataStore.setState({ ...result });
};

/**
 * 將選擇中的項目的路徑寫入系統剪貼簿
 */
const handleCopyToSystem = ({ mode }: { mode: "paths" | "names" }) => {
  const { selected } = selectionStore.getState();
  const { entries } = viewDataStore.getState();
  const fileList = entries.filter((_, index) => Boolean(selected[index]));

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
