import { create } from "zustand";
import { fileSystemDataStore } from "./data";

/**
 * 對於一個 row 來說，先以 overrides[filePath] 為主，若無定義則 isDefaultSelected 時為選取，否則不選取
 * 可以將 overrides 視為 "例外清單", isDefaultSelected 為 "預設值"
 */
type SparseSelection = {
  isDefaultSelected: boolean;
  overrides: { [filePath: string]: boolean };
};

const fileSystemSelectionStore = create<SparseSelection>(() => ({
  isDefaultSelected: false,
  overrides: {},
}));

/** 可直接用於 UI 的工具，提供一個 row 是否被選取的工具，與選取數量計算 */
const useSelection = () => {
  const overrides = fileSystemSelectionStore((state) => state.overrides);
  const isDefaultSelected = fileSystemSelectionStore((state) => state.isDefaultSelected);

  // 先看例外清單，無定義則回傳預設值
  const isSelected = (filePath: string) => {
    const selectionState = overrides[filePath];
    return selectionState !== undefined ? selectionState : isDefaultSelected;
  };

  const files = fileSystemDataStore((state) => state.files);
  const filePathSet = new Set(files.map((file) => file.filePath));
  const overrideEntries = Object.entries(overrides);

  let selectedCount = 0;
  if (isDefaultSelected) {
    // 計算未選取的數量，再用總數扣除，排除已不在目前檔案列表中的路徑
    const deselectedCount = overrideEntries.filter(([path, selected]) => !selected && filePathSet.has(path)).length;
    selectedCount = files.length - deselectedCount;
  } else {
    // 計算被選取的數量，排除已不在目前檔案列表中的路徑
    selectedCount = overrideEntries.filter(([path, selected]) => selected && filePathSet.has(path)).length;
  }

  return { isSelected, selectedCount };
};

/** 預設 toggle 單行的選擇狀態，可選強制指定其選擇狀態 */
const selectRow = (filePath: string, selected?: boolean) => {
  fileSystemSelectionStore.setState(({ isDefaultSelected, overrides }) => {
    const currentState = overrides[filePath] ?? isDefaultSelected;
    const nextState = selected ?? !currentState;

    // 若 nextState 與 isDefaultSelected 相同，表示與預設值相同，則不需在 overrides 中記錄
    if (nextState === isDefaultSelected) {
      const { [filePath]: _, ...rest } = overrides;
      return { overrides: rest };
    } else {
      return { overrides: { ...overrides, [filePath]: nextState } };
    }
  });
};

/** 清除所有選取 */
const clearSelection = () => {
  fileSystemSelectionStore.setState({ isDefaultSelected: false, overrides: {} });
};

/** 全選 */
const selectAll = () => {
  fileSystemSelectionStore.setState({ isDefaultSelected: true, overrides: {} });
};

export { useSelection, selectRow, clearSelection, selectAll };
