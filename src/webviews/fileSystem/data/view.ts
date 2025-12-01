import { create } from "zustand";
import { fileSystemDataStore } from "./data";
import type { InspectDirectoryEntry } from "@/utils/system";
import type { Prettify } from "@/utils";

// ----------------------------------------------------------------------------
// 定義檔案系統可以如何被檢視的狀態
// ----------------------------------------------------------------------------

type FileProperties = Prettify<InspectDirectoryEntry & { icon: `codicon codicon-${string}` }>;

type ViewStateStore = {
  sortField: keyof Pick<FileProperties, "fileName" | "mtime" | "ctime" | "size">;
  sortOrder: "asc" | "desc";
  filter: "all" | "file" | "folder";
};

const initialViewState: ViewStateStore = {
  sortField: "fileName",
  sortOrder: "asc",
  filter: "all",
};

const fileSystemViewStore = create<ViewStateStore>(() => initialViewState);

export { fileSystemViewStore };
export type { FileProperties };

// ----------------------------------------------------------------------------
// 定義用於實際呈現在表格中的檔案系統資料狀態
// (以及同樣需要依賴於原始資料與檢視條件的選取狀態)
// ----------------------------------------------------------------------------

type ViewDataStore = {
  entries: FileProperties[];
  selected: (0 | 1)[];
};

const initialViewData: ViewDataStore = {
  entries: [],
  selected: [],
};

const fileSystemViewDataStore = create<ViewDataStore>(() => initialViewData);

export { fileSystemViewDataStore };

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

/**
 * 將檔案屬性陣列擴展成帶有圖示的檔案屬性陣列
 */
const assignIconToEntries = (entries: InspectDirectoryEntry[]): FileProperties[] => {
  return entries.map((entry) => ({ ...entry, icon: `codicon codicon-${entry.fileType}` }));
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
  const entriesWithIcons = assignIconToEntries(entriesSorted);

  const selected = Array<0 | 1>(entriesWithIcons.length).fill(0);
  fileSystemViewDataStore.setState({ entries: entriesWithIcons, selected });
};

/**
 * 實現更新鏈/依賴鏈的訂閱
 */
fileSystemViewStore.subscribe(handleDataUpdate);
fileSystemDataStore.subscribe(handleDataUpdate);

// ----------------------------------------------------------------------------
// 定義用於更改檔案系統檢視狀態的行為
// ----------------------------------------------------------------------------

/** 選取某個項目 */
const selectRow = (index: number) => {
  fileSystemViewDataStore.setState((state) => {
    if (index < 0 || index >= state.selected.length) return {}; // 無效索引，不觸發重新渲染
    const newSelected = [...state.selected];
    newSelected[index] = (1 - newSelected[index]) as 0 | 1;
    return { ...state, selected: newSelected };
  });
};

/** 全選 */
const selectAll = () => {
  fileSystemViewDataStore.setState((state) => {
    const newSelected = Array<0 | 1>(state.selected.length).fill(1);
    return { ...state, selected: newSelected };
  });
};

/** 清空選取 */
const selectNone = () => {
  fileSystemViewDataStore.setState((state) => {
    const newSelected = Array<0 | 1>(state.selected.length).fill(0);
    return { ...state, selected: newSelected };
  });
};

/** 反轉選取 */
const selectInvert = () => {
  fileSystemViewDataStore.setState((state) => {
    const newSelected = state.selected.map((value) => (1 - value) as 0 | 1);
    return { ...state, selected: newSelected };
  });
};

/** 設定排序欄位與順序，如果點擊的是同一欄位，切換順序；否則使用預設升序 */
const setSorting = (field: ViewStateStore["sortField"]) => {
  const { sortField, sortOrder } = fileSystemViewStore.getState();
  const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
  fileSystemViewStore.setState({ sortField: field, sortOrder: newOrder });
};

/** 設定篩選條件 */
const setFilter = (filter: ViewStateStore["filter"]) => {
  fileSystemViewStore.setState({ filter });
};

export { selectRow, selectNone, selectAll, selectInvert, setSorting, setFilter };
