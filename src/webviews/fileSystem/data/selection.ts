import { fileSystemDataStore } from "./data";
import { postMessageToExtension } from "../../utils/vscodeApi";
import type { FileSystemRequest } from "../../../providers/fileSystemProvider";

const postMessage = (params: FileSystemRequest) => postMessageToExtension(params);

/** 可直接用於 UI 的工具，提供一個 row 是否被選取的工具，與選取數量計算 */
const useSelection = () => {
  const selectionCount = fileSystemDataStore((state) => state.selectionCount);
  const selection = fileSystemDataStore((state) => state.selection);
  const { overrides, isDefaultSelected } = selection;

  // 先看例外清單，無定義則回傳預設值
  const isSelected = (filePath: string) => {
    const selectionState = overrides[filePath];
    return selectionState !== undefined ? selectionState : isDefaultSelected;
  };

  return { isSelected, selectedCount: selectionCount };
};

/** 預設 toggle 單行的選擇狀態，可選強制指定其選擇狀態 */
const selectRow = (filePath: string, selected?: boolean) => {
  const selection = fileSystemDataStore.getState().selection;
  const { overrides, isDefaultSelected } = selection;

  const currentState = overrides[filePath] ?? isDefaultSelected;
  const nextState = selected ?? !currentState;

  // 若 nextState 與 isDefaultSelected 相同，表示與預設值相同，則不需在 overrides 中記錄
  if (nextState === isDefaultSelected) {
    const { [filePath]: _, ...rest } = overrides;
    postMessage({
      type: "request",
      ...fileSystemDataStore.getState(),
      selection: { isDefaultSelected, overrides: rest },
    });
  } else {
    postMessage({
      type: "request",
      ...fileSystemDataStore.getState(),
      selection: { isDefaultSelected, overrides: { ...overrides, [filePath]: nextState } },
    });
  }
};

/** 清除所有選取 */
const clearSelection = () => {
  postMessage({
    type: "request",
    ...fileSystemDataStore.getState(),
    selection: { isDefaultSelected: false, overrides: {} },
  });
};

/** 全選 */
const selectAll = () => {
  postMessage({
    type: "request",
    ...fileSystemDataStore.getState(),
    selection: { isDefaultSelected: true, overrides: {} },
  });
};

export { useSelection, selectRow, clearSelection, selectAll };
