import { create } from "zustand";
import { fileSystemDataStore } from "./data";
import { extensionIconMap } from "@/assets/fileExtMap";
import type { InspectDirectoryEntry } from "@/utils/system";
import type { Prettify } from "@/utils";

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

/**
 * 定義系統瀏覽器可以如何被檢視的狀態
 */
const fileSystemViewStore = create<ViewStateStore>(() => initialViewState);

type ViewDataStore = {
  entries: FileProperties[];
  selected: (0 | 1)[];
  lastSelectedIndex: number | null;
  renamingIndex: number | null;
};

const initialViewData: ViewDataStore = {
  entries: [],
  selected: [],
  lastSelectedIndex: null,
  renamingIndex: null,
};

/**
 * 定義需要依賴於原始資料與檢視條件的狀態，比如根據檢視狀態計算後的列表或是以索引為基礎的選取狀態等
 */
const fileSystemViewDataStore = create<ViewDataStore>(() => initialViewData);

export { fileSystemViewStore, fileSystemViewDataStore };
export type { FileProperties, ViewStateStore };

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
  return entries.map((entry) => {
    let icon: `codicon codicon-${string}` = `codicon codicon-${entry.fileType}`;

    if (entry.fileType !== "file") return { ...entry, icon };

    const fileName = entry.fileName.toLowerCase();
    const extension = fileName.includes(".") ? fileName.split(".").pop() || "" : "";

    if (extension in extensionIconMap) {
      icon = extensionIconMap[extension];
    }

    return { ...entry, icon };
  });
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

  fileSystemViewDataStore.setState({
    entries: entriesWithIcons,
    selected,
    lastSelectedIndex: null,
    renamingIndex: null,
  });
};

/**
 * 實現更新鏈/依賴鏈的訂閱
 */
fileSystemViewStore.subscribe(handleDataUpdate);
fileSystemDataStore.subscribe(handleDataUpdate);
