import { fileSystemViewDataStore } from "./view";

/** 選取某個項目 */
const selectRow = (params: { index: number; isAdditive: boolean; isRange: boolean }) => {
  const { index: currentIndex, isAdditive, isRange } = params;

  fileSystemViewDataStore.setState((state) => {
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
      const targetState = newSelected[currentIndex] === 0 ? 1 : 0;
      for (const index of targetIndices) newSelected[index] = targetState;
    }

    return { selected: newSelected, lastSelectedIndex: currentIndex };
  });
};

/** 全選 */
const selectAll = () => {
  fileSystemViewDataStore.setState((state) => {
    const newSelected = Array<0 | 1>(state.selected.length).fill(1);
    return { selected: newSelected, lastSelectedIndex: null };
  });
};

/** 清空選取 */
const selectNone = () => {
  fileSystemViewDataStore.setState((state) => {
    const newSelected = Array<0 | 1>(state.selected.length).fill(0);
    return { selected: newSelected, lastSelectedIndex: null };
  });
};

/** 反轉選取 */
const selectInvert = () => {
  fileSystemViewDataStore.setState((state) => {
    const newSelected = state.selected.map((value) => (1 - value) as 0 | 1);
    return { selected: newSelected, lastSelectedIndex: null };
  });
};

/** 在全局註冊有關選取的事件 */
const registerSelectionEvents = () => {
  window.addEventListener(
    "keydown",
    (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) selectNone();
        else selectAll();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        selectInvert();
      }
    },
    true
  );
};

export { selectRow, selectNone, selectAll, selectInvert, registerSelectionEvents };
