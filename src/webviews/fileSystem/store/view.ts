import { create } from "zustand";
import { fileSystemDataStore } from "@@/fileSystem/store/data";
import type { InspectDirectoryEntry } from "@/utils/system";

// ----------------------------------------------------------------------------

type ViewStateStore = {
  sortField: keyof Pick<InspectDirectoryEntry, "fileName" | "mtime" | "ctime" | "size">;
  sortOrder: "asc" | "desc";
  filter: "all" | "file" | "folder";
};

/**
 * 建立用於檢視系統瀏覽器的狀態容器
 */
const fileSystemViewStore = create<ViewStateStore>(() => ({
  sortField: "fileName",
  sortOrder: "asc",
  filter: "all",
}));

type ViewDataStore = {
  entries: InspectDirectoryEntry[];
  selected: (0 | 1)[];
  lastSelectedIndex: number | null;
};

/**
 * 定義需要依賴於原始資料與檢視條件的狀態，比如根據檢視狀態計算後的列表或是以索引為基礎的選取狀態等
 */
const fileSystemViewDataStore = create<ViewDataStore>(() => ({
  entries: [],
  selected: [],
  lastSelectedIndex: null,
}));

export { fileSystemViewStore, fileSystemViewDataStore };
export type { ViewStateStore };

// ----------------------------------------------------------------------------
// 定義用於根據檔案系統資料與檢視條件計算 viewData 的輔助函式
// ----------------------------------------------------------------------------

/**
 * 根據目前的篩選條件回傳篩選後的檔案屬性陣列
 */
const filterEntries = (entries: InspectDirectoryEntry[]) => {
  const { filter } = fileSystemViewStore.getState();

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
  const { sortField, sortOrder } = fileSystemViewStore.getState();

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
// 定義更新鏈/依賴鏈，可參考 README.md 中的說明
// ----------------------------------------------------------------------------

/**
 * 當檢視條件或檔案系統任一更新時，重新計算 viewData 並清空選取狀態
 */
const handleDataUpdate = () => {
  const entries = fileSystemDataStore.getState().entries;

  const entriesFiltered = filterEntries(entries);
  const entriesSorted = sortEntries(entriesFiltered);

  const selected = Array<0 | 1>(entriesSorted.length).fill(0);

  fileSystemViewDataStore.setState({
    entries: entriesSorted,
    selected,
    lastSelectedIndex: null,
  });
};

/**
 * 實現更新鏈/依賴鏈的訂閱
 */
fileSystemViewStore.subscribe(handleDataUpdate);
fileSystemDataStore.subscribe(handleDataUpdate);
