import { selectionStore } from "@@/fileSystem/store/data";

/** 開關框選模式 */
const toggleBoxSelectionMode = (forceMode?: boolean) => {
  selectionStore.setState((state) => ({ isBoxSelecting: forceMode ?? !state.isBoxSelecting }));
};

/** 選取某個項目 */
const selectRow = (params: { index: number; isAdditive: boolean; isRange: boolean; forceSelect?: boolean }) => {
  const { index: currentIndex, isAdditive, isRange, forceSelect } = params;

  selectionStore.setState((state) => {
    if (currentIndex < 0 || currentIndex >= state.selected.length) {
      return {}; // 無效索引，不觸發重新渲染
    }

    // 獲取上次點擊的索引，如果 state.lastSelectedIndex 為 null/undefined/無效，則預設為當前點擊的索引
    let lastSelectedIndex = state.lastSelectedIndex;
    if (lastSelectedIndex === null || lastSelectedIndex < 0 || lastSelectedIndex >= state.selected.length) {
      lastSelectedIndex = currentIndex;
    }

    const newSelected = [...state.selected];
    let targetIndices: number[] = [];

    // --- 修改器1 isRange ---
    if (isRange) {
      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);
      for (let i = start; i <= end; i++) targetIndices.push(i);
    } else {
      targetIndices.push(currentIndex);
    }

    // --- 修改器2 isAdditive ---
    if (!isAdditive) {
      newSelected.fill(0);
      for (const index of targetIndices) newSelected[index] = 1;
    } else {
      let targetState: 0 | 1;

      if (forceSelect) {
        targetState = 1;
      } else {
        targetState = newSelected[currentIndex] === 0 ? 1 : 0;
      }

      for (const index of targetIndices) newSelected[index] = targetState;
    }

    return { selected: newSelected, lastSelectedIndex: currentIndex };
  });
};

/** 全選 */
const selectAll = () => {
  selectionStore.setState((state) => {
    const newSelected = Array<0 | 1>(state.selected.length).fill(1);
    return { selected: newSelected, lastSelectedIndex: null };
  });
};

/** 清空選取 */
const selectNone = () => {
  selectionStore.setState((state) => {
    const newSelected = Array<0 | 1>(state.selected.length).fill(0);
    return { selected: newSelected, lastSelectedIndex: null };
  });
};

/** 反轉選取 */
const selectInvert = () => {
  selectionStore.setState((state) => {
    const newSelected = state.selected.map((value) => (1 - value) as 0 | 1);
    return { selected: newSelected, lastSelectedIndex: null };
  });
};

export { toggleBoxSelectionMode, selectRow, selectNone, selectAll, selectInvert };
