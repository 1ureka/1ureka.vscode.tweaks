/**
 * @file 依賴鏈
 * @description 該文件負責定義更新鏈/依賴鏈，可參考 README.md 中的說明
 */

import { dataStore, viewDataStore, viewStateStore, selectionStore, renameStore } from "@@/fileSystem/store/data";
import type { InspectDirectoryEntry } from "@/utils/system";

/**
 * 根據目前的篩選條件回傳篩選後的檔案屬性陣列
 */
const filterEntries = (entries: InspectDirectoryEntry[]) => {
  const { filter } = viewStateStore.getState();

  let filteredEntries: InspectDirectoryEntry[] = [];
  if (filter === "all") {
    filteredEntries = [...entries];
  } else {
    filteredEntries = entries.filter(({ fileType }) => fileType === filter);
  }

  return filteredEntries;
};

/**
 * 根據目前的排序欄位與順序回傳排序後的檔案屬性陣列
 */
const sortEntries = (entries: InspectDirectoryEntry[]) => {
  const { sortField, sortOrder } = viewStateStore.getState();

  const sortedEntries = [...entries];
  sortedEntries.sort((a, b) => {
    // 排序：資料夾優先，否則依照 sortField 與 sortOrder 排序
    if (a.fileType === "folder" && b.fileType !== "folder") return -1;
    if (a.fileType !== "folder" && b.fileType === "folder") return 1;

    const valA = a[sortField];
    const valB = b[sortField];

    let compareResult: number;
    if (typeof valA === "string" && typeof valB === "string") {
      compareResult = valA.localeCompare(valB);
    } else {
      compareResult = Number(valA) - Number(valB);
    }

    return sortOrder === "asc" ? compareResult : -compareResult;
  });

  return sortedEntries;
};

// ----------------------------------------------------------------------------

/**
 * 當檢視條件或來源資料任一更新時，重新計算檢視資料
 */
const handleViewDataUpdate = () => {
  const entries = dataStore.getState().entries;

  const entriesFiltered = filterEntries(entries);
  const entriesSorted = sortEntries(entriesFiltered);

  viewDataStore.setState({ entries: entriesSorted });
};

/**
 * 當檢視資料更新時，清空選取狀態
 */
const handleSelectionUpdate = () => {
  const entries = viewDataStore.getState().entries;

  const selected = Array<0 | 1>(entries.length).fill(0);

  selectionStore.setState({ selected, lastSelectedIndex: null });
};

/**
 * 當最後選取的項目更改時，捨棄暫存的重新命名狀態，改為新項目的名稱
 */
const handleRenameReset = () => {
  const { lastSelectedIndex } = selectionStore.getState();
  const { entries } = viewDataStore.getState();

  if (lastSelectedIndex === null) {
    renameStore.setState({ srcName: "", destName: "" });
    return;
  }

  const srcName = entries[lastSelectedIndex]?.fileName || "";
  renameStore.setState({ srcName, destName: srcName });
};

// ----------------------------------------------------------------------------

/**
 * 定義更新鏈/依賴鏈，由於 handler 都是同步的，因此鏈上任意一點產生的反應都會是原子化的
 * 具體來說，在 JavaScript 的 單執行緒（Single-threaded） 模型下，這條「訂閱鏈」本質上就是一個連續執行的執行棧（Call Stack）
 *
 * ```
 * 來源資料 ──┐
 *            ├──> 檢視資料 ────> 選取狀態 ───> 重新命名狀態
 * 檢視條件 ──┘
 * ```
 */
const setupDependencyChain = () => {
  dataStore.subscribe(handleViewDataUpdate);
  viewStateStore.subscribe(handleViewDataUpdate);
  viewDataStore.subscribe(handleSelectionUpdate);
  selectionStore.subscribe(handleRenameReset);
};

export { setupDependencyChain };
