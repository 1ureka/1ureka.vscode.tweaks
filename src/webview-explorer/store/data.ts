/**
 * @file 狀態容器
 * @description 該文件負責定義對於 UI 來說只讀的狀態容器，可參考 README.md 中的說明
 */

import { create } from "zustand";
import { invoke } from "@explorer/store/init";
import { getInitialData } from "@/utils-vscode/message/client";
import type { InspectDirectoryEntry } from "@/utils/system";
import type { ImageMetadata } from "@/utils/image";
import type { ReadResourceResult } from "@/providers/explorerProvider";
import type { SystemFolder, VolumeInfo } from "@/utils/system-windows";

const initialData = getInitialData<ReadResourceResult>();
if (!initialData) {
  invoke("show.error", "無法取得檔案系統初始資料");
  throw new Error("無法取得檔案系統初始資料");
}

const initialPath = initialData.currentPath;

const initialPathHeatmap = new Map<string, number>();
initialPathHeatmap.set(initialPath, 1);

const initialNavigationState = {
  currentPath: initialPath,
  destPath: initialPath,
  pathHeatmap: initialPathHeatmap,
  recentlyVisitedPaths: [initialPath],
  mostFrequentPaths: [initialPath],
};

const initialViewDataState = {
  viewMode: initialData.mode,
  entries: [],
  imageEntries: { tracks: [], yMax: 0 },
};

const initialNavigationExternalState = {
  favoritePaths: [],
  systemFolders: [],
  systemDrives: [],
};

const initialViewState = {
  sortField: "fileName",
  sortOrder: "asc",
  filter: "all",
  gridColumns: 3,
  gridGap: true,
} as const;

// ----------------------------------------------------------------------------

type NavigationState = {
  currentPath: string;
  destPath: string;
  pathHeatmap: Map<string, number>;
  recentlyVisitedPaths: string[];
  mostFrequentPaths: string[];
};

type NavigateHistoryState = {
  history: string[];
  currentIndex: number;
};

type NavigationExternalState = {
  favoritePaths: string[];
  systemFolders: SystemFolder[];
  systemDrives: VolumeInfo[];
};

type ViewState = {
  sortField: keyof Pick<InspectDirectoryEntry, "fileName" | "mtime" | "ctime" | "size">;
  sortOrder: "asc" | "desc";
  filter: "all" | "file" | "folder";
  gridColumns: number;
  gridGap: boolean;
};

type ViewDataState = {
  viewMode: typeof initialData.mode;
  entries: InspectDirectoryEntry[];
  imageEntries: {
    tracks: { item: ImageMetadata; yStart: number; yEnd: number }[][];
    yMax: number;
  };
};

type SelectionState = {
  selected: (0 | 1)[];
  lastSelectedIndex: number | null;
};

type ClipboardState = {
  entries: { [filePath: string]: InspectDirectoryEntry };
};

type RenameState = {
  srcName: string;
  destName: string;
};

// ----------------------------------------------------------------------------

/**
 * 建立前端用於儲存檔案系統資料的容器
 */
const dataStore = create<ReadResourceResult>(() => ({ ...initialData }));

/**
 * 建立用於儲存導航狀態的容器
 */
const navigationStore = create<NavigationState>(() => ({ ...initialNavigationState }));

/**
 * 建立用於儲存導航歷史狀態的容器
 */
const navigateHistoryStore = create<NavigateHistoryState>(() => ({ history: [initialPath], currentIndex: 0 }));

/**
 * 建立用於儲存導航外部狀態的容器，所謂外部就是與目前目錄無關的導航資料，他們的請求、更新與應用的其他狀態無關
 */
const navigationExternalStore = create<NavigationExternalState>(() => ({ ...initialNavigationExternalState }));

/**
 * 建立用於檢視系統瀏覽器的狀態容器
 */
const viewStateStore = create<ViewState>(() => ({ ...initialViewState }));

/**
 * 建立用於儲存根據檢視條件計算後，要顯示的資料狀態的容器
 */
const viewDataStore = create<ViewDataState>(() => ({ ...initialViewDataState }));

/**
 * 建立用於儲存選取狀態的容器
 */
const selectionStore = create<SelectionState>(() => ({ selected: [], lastSelectedIndex: null }));

/**
 * 建立用於儲存剪貼簿資料的容器
 */
const clipboardStore = create<ClipboardState>(() => ({ entries: {} }));

/**
 * 建立用於儲存重新命名狀態的容器，包含來源名稱與使用者輸入的目標名稱
 */
const renameStore = create<RenameState>(() => ({ srcName: "", destName: "" }));

// ----------------------------------------------------------------------------

export { navigationStore, navigateHistoryStore, navigationExternalStore };
export { dataStore, viewStateStore, viewDataStore };
export { selectionStore, clipboardStore, renameStore };
export type { ViewState };
