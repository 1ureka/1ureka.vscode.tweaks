import { useEffect } from "react";
import { tableRowClassName, tableRowIndexAttr } from "@@/fileSystem/layout/TableRow";
import { tableBodyContainerId } from "@@/fileSystem/layout/TableBody";

import { navigateToFolder } from "@@/fileSystem/action/navigation";
import { openFile, startFileDrag } from "@@/fileSystem/action/operation";
import { selectRow } from "@@/fileSystem/action/selection";
import { viewDataStore } from "@@/fileSystem/store/data";

/**
 * 根據事件獲取對應的資料列索引
 */
const getIndexFromEvent = (e: Event) => {
  const target = e.target as HTMLElement;

  const indexStr = target.closest(`.${tableRowClassName}`)?.getAttribute(tableRowIndexAttr);
  if (indexStr === undefined) return null;

  const index = Number(indexStr);
  if (isNaN(index)) return null;

  return index;
};

/**
 * 處理開始拖動某一資料列的事件
 */
const handleDragStart = (e: DragEvent) => {
  const index = getIndexFromEvent(e);
  if (index === null) return;

  const row = viewDataStore.getState().entries[index];
  if (!row) return;

  startFileDrag({ e, ...row });
};

/**
 * 處理點擊某一資料列的事件
 */
const handleClick = (e: MouseEvent) => {
  const index = getIndexFromEvent(e);
  if (index === null) return;

  const row = viewDataStore.getState().entries[index];
  if (!row) return;

  selectRow({ index, isAdditive: e.ctrlKey || e.metaKey, isRange: e.shiftKey });

  if (e.detail !== 2) return;

  const { fileType, filePath } = row;

  if (fileType === "folder" || fileType === "file-symlink-directory") {
    navigateToFolder({ dirPath: filePath });
  } else if (fileType === "file" || fileType === "file-symlink-file") {
    openFile(filePath);
  }
};

/**
 * 處理右鍵點擊某一資料列的事件
 */
const handleContextMenu = (e: MouseEvent) => {
  const index = getIndexFromEvent(e);
  if (index === null) return;

  // 該設置是為了方便在右鍵選單中透過強制選取該列，來重新命名、刪除等操作
  selectRow({ index, isAdditive: true, isRange: false, forceSelect: true });
};

/**
 * 將表格主體的事件處理程式掛載到對應的容器上
 */
const useTableBodyEventHandlers = () => {
  useEffect(() => {
    const container = document.getElementById(tableBodyContainerId);
    if (!container) return;

    container.addEventListener("click", handleClick);
    container.addEventListener("contextmenu", handleContextMenu);
    container.addEventListener("dragstart", handleDragStart);

    return () => {
      container.removeEventListener("click", handleClick);
      container.removeEventListener("contextmenu", handleContextMenu);
      container.removeEventListener("dragstart", handleDragStart);
    };
  }, []);
};

export { useTableBodyEventHandlers };
