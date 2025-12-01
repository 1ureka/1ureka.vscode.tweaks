import { create } from "zustand";
import { fileSystemDataStore } from "./data";
import type { InspectDirectoryEntry } from "@/utils/system";
import type { Prettify } from "@/utils";

// ----------------------------------------------------------------------------
// 定義檔案系統可以如何被檢視的狀態
// ----------------------------------------------------------------------------

const FILES_PER_PAGE = 50;

type FileProperties = Prettify<InspectDirectoryEntry & { icon: `codicon codicon-${string}` }>;

type ViewStateStore = {
  page: number;
  pages: number;
  sortField: keyof Pick<FileProperties, "fileName" | "mtime" | "ctime" | "size">;
  sortOrder: "asc" | "desc";
  filter: "all" | "file" | "folder";
  selection: { isDefaultSelected: boolean; overrides: { [filePath: string]: boolean } };
  timestamp: number; // 用於將 fileSystemData 的更新繼續向下傳遞給 fileSystemViewData
};

const initialViewState: ViewStateStore = {
  page: 1,
  pages: 1,
  sortField: "fileName",
  sortOrder: "asc",
  filter: "all",
  selection: { isDefaultSelected: false, overrides: {} },
  timestamp: Date.now(),
};

const fileSystemViewStore = create<ViewStateStore>(() => initialViewState);

export { fileSystemViewStore };
export type { FileProperties };

// ----------------------------------------------------------------------------
// 當檔案系統資料更新時，驗證檢視狀態的合理性，並在驗證完成後確保將更新鏈繼續傳遞下去
// ----------------------------------------------------------------------------

/**
 * 驗證選取狀態與選取數量
 */
const validateSelection = (entries: InspectDirectoryEntry[]) => {
  const { selection } = fileSystemViewStore.getState();
  const { overrides } = selection;

  const entryPaths = new Set(entries.map((entry) => entry.filePath));
  const validOverrides: { [filePath: string]: boolean } = {};

  for (const [filePath, selected] of Object.entries(overrides)) {
    if (entryPaths.has(filePath)) {
      validOverrides[filePath] = selected;
    }
  }

  fileSystemViewStore.setState({
    selection: { isDefaultSelected: selection.isDefaultSelected, overrides: validOverrides },
  });
};

/**
 * 驗證分頁是否合理
 */
const validatePagination = (entries: InspectDirectoryEntry[]) => {
  const { page, filter } = fileSystemViewStore.getState();

  let filteredEntries: InspectDirectoryEntry[] = [];
  if (filter === "all") {
    filteredEntries = [...entries];
  } else {
    filteredEntries = entries.filter(({ fileType }) => fileType === filter);
  }

  const totalPages = Math.ceil(filteredEntries.length / FILES_PER_PAGE);
  const validPage = page > totalPages ? Math.max(1, totalPages) : page;

  fileSystemViewStore.setState({ page: validPage, pages: totalPages });
};

/** 確保當檔案系統更新時，選取狀態與分頁是合理的 */
fileSystemDataStore.subscribe(({ entries }) => {
  validateSelection(entries);
  validatePagination(entries);
  fileSystemViewStore.setState({ timestamp: Date.now() }); // 觸發 viewData 的更新
});

// ----------------------------------------------------------------------------
// 一些輔助提供更直觀的 viewState 的 selector 函數，由於更新鏈的存在，
// 我認為這裡都可以相信 viewState 是合理的 (比如 overrides 裡面一定是正確的，因此選取數量不會算錯)
// ----------------------------------------------------------------------------

/**
 * 計算目前選取的項目數量
 */
const useSelectionCount = () => {
  const selection = fileSystemViewStore((state) => state.selection);
  const entries = fileSystemDataStore((state) => state.entries);
  const { isDefaultSelected, overrides } = selection;

  let selectionCount = 0;
  if (isDefaultSelected) {
    // 計算未選取的數量，再用總數扣除
    const deselectedCount = Object.values(overrides).filter((selected) => !selected).length;
    selectionCount = entries.length - deselectedCount;
  } else {
    // 計算被選取的數量
    selectionCount = Object.values(overrides).filter((selected) => selected).length;
  }

  return selectionCount;
};

/**
 * 判斷某個項目是否被選取
 */
const useIsSelected = () => {
  const selection = fileSystemViewStore((state) => state.selection);

  return (filePath: string) => {
    const { isDefaultSelected, overrides } = selection;

    if (filePath in overrides) {
      return overrides[filePath];
    }

    return isDefaultSelected;
  };
};

export { useSelectionCount, useIsSelected };

// ----------------------------------------------------------------------------
// 定義用於實際呈現在表格中的檔案系統資料狀態
// ----------------------------------------------------------------------------

type ViewDataStore = { entries: FileProperties[] };

const initialViewData: ViewDataStore = { entries: [] };

const fileSystemViewDataStore = create<ViewDataStore>(() => initialViewData);

// ----------------------------------------------------------------------------
// 當檢視條件或檔案系統資料(透過更新鏈)任一更新時，重新計算用於呈現的檔案系統資料
// ----------------------------------------------------------------------------

/**
 * 將檔案屬性陣列擴展成帶有圖示的檔案屬性陣列
 */
const assignIconToEntries = (entries: InspectDirectoryEntry[]): FileProperties[] => {
  return entries.map((entry) => ({ ...entry, icon: `codicon codicon-${entry.fileType}` }));
};

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
 * 根據目前的頁碼回傳分頁後的檔案屬性陣列
 */
const paginateEntries = (entries: InspectDirectoryEntry[]) => {
  const { page } = fileSystemViewStore.getState();

  const startIndex = (page - 1) * FILES_PER_PAGE;
  const endIndex = startIndex + FILES_PER_PAGE;
  const paginatedEntries = entries.slice(startIndex, endIndex);

  return paginatedEntries;
};

/**
 * 當檢視條件或檔案系統任一更新時，重新計算 viewData
 */
fileSystemViewStore.subscribe(() => {
  const entries = fileSystemDataStore.getState().entries;

  const entriesFiltered = filterEntries(entries);
  const entriesSorted = sortEntries(entriesFiltered);
  const entriesPaginated = paginateEntries(entriesSorted);
  const entriesWithIcons = assignIconToEntries(entriesPaginated);

  fileSystemViewDataStore.setState({ entries: entriesWithIcons });
});

export { fileSystemViewDataStore };

// ----------------------------------------------------------------------------
// 定義用於更改檔案系統檢視狀態的行為
// ----------------------------------------------------------------------------

/** 換頁 */
const setPage = (page: number) => {
  fileSystemViewStore.setState({ page });
};

/** 選取某個項目 */
const selectRow = (filePath: string, selected?: boolean) => {
  fileSystemViewStore.setState(({ selection }) => {
    const { isDefaultSelected, overrides } = selection;
    const currentState = overrides[filePath] ?? isDefaultSelected;
    const nextState = selected ?? !currentState;

    // 若 nextState 與 isDefaultSelected 相同，表示與預設值相同，則不需在 overrides 中記錄
    if (nextState === isDefaultSelected) {
      const { [filePath]: _, ...rest } = overrides;
      return { selection: { isDefaultSelected, overrides: rest } };
    } else {
      return { selection: { isDefaultSelected, overrides: { ...overrides, [filePath]: nextState } } };
    }
  });
};

/** 清空選取 */
const clearSelection = () => {
  fileSystemViewStore.setState({ selection: { isDefaultSelected: false, overrides: {} } });
};

/** 設定排序欄位與順序 */
const setSorting = (field: ViewStateStore["sortField"]) => {
  const { sortField, sortOrder } = fileSystemViewStore.getState();
  // 如果點擊的是同一欄位，切換順序；否則使用預設升序
  const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";

  fileSystemViewStore.setState({ sortField: field, sortOrder: newOrder });
};

/** 設定篩選條件 */
const setFilter = (filter: ViewStateStore["filter"]) => {
  clearSelection(); // 避免使用者忘記篩選掉的項目可能還被選取著

  fileSystemViewStore.setState({ filter, page: 1 });

  validatePagination(fileSystemDataStore.getState().entries);
};

export { setPage, selectRow, clearSelection, setSorting, setFilter };
