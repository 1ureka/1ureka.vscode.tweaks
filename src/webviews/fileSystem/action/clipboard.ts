import type { PasteAPI, SetSystemClipboardAPI } from "@/providers/fileSystemProvider";
import type { InspectDirectoryEntry } from "@/utils/system";
import { invoke } from "@/utils/message_client";
import { clipboardStore, dataStore, selectionStore, viewDataStore } from "@@/fileSystem/store/data";
import { requestQueue } from "@@/fileSystem/store/queue";

/**
 * 將目前選取的檔案寫入到應用程式剪貼簿，會覆蓋先前的內容
 */
const writeClipboard = () => {
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
 * 觸發將應用程式剪貼簿中的項目放置到目前資料夾的流程
 */
const readClipboard = async () => {
  const { entries } = clipboardStore.getState();
  const clipboardList = Object.values(entries);
  if (clipboardList.length === 0) return;

  const srcList = clipboardList.map((entry) => entry.filePath);
  const { currentPath } = dataStore.getState();

  const result = await requestQueue.add(() => invoke<PasteAPI>("paste", { srcList, destDir: currentPath }));
  if (!result) return;

  clipboardStore.setState({ entries: {} });
  dataStore.setState({ ...result });
};

/**
 * 將最後選擇的項目的路徑或名稱寫入系統剪貼簿
 */
const writeSystemClipboard = (type: "path" | "name") => {
  const { lastSelectedIndex } = selectionStore.getState();
  if (!lastSelectedIndex) return;

  const { entries } = viewDataStore.getState();
  const item = entries[lastSelectedIndex];
  if (!item) return;

  const text = type === "name" ? item.fileName : item.filePath;
  return invoke<SetSystemClipboardAPI>("setSystemClipboard", { text });
};

export { writeClipboard, readClipboard, writeSystemClipboard };
