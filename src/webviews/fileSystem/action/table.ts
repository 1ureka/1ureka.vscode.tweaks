import { useEffect } from "react";
import { tableRowClassName, tableRowIndexAttr } from "@@/fileSystem/layout/TableRow";
import { tableBodyContainerId, tableBodyVirtualListContainerId } from "@@/fileSystem/layout/TableBody";

import { navigateToFolder } from "@@/fileSystem/action/navigation";
import { openFile, startFileDrag } from "@@/fileSystem/action/operation";
import { selectRow } from "@@/fileSystem/action/selection";
import { selectionStore, viewDataStore } from "@@/fileSystem/store/data";

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
 * 根據起始點創建繪製框選框的函式
 */
function createHandleDrawBox(params: { boxContainer: HTMLElement; startX: number; startY: number }) {
  const { boxContainer, ...startPosition } = params;
  const box = document.createElement("div");

  /**
   * 將座標轉換為相對於容器的座標，並限制在容器範圍內
   */
  const relativeToContainer = ({ x, y }: { x: number; y: number }) => {
    const rect = boxContainer.getBoundingClientRect();

    const relX = Math.max(0, Math.min(x - rect.left, rect.width));
    const relY = Math.max(0, Math.min(y - rect.top, rect.height));

    return { x: relX, y: relY };
  };

  const { x: startX, y: startY } = relativeToContainer({ x: startPosition.startX, y: startPosition.startY });

  const handleDrawStart = () => {
    const stripeGap = 10;
    const stripeSize = 24;

    box.style.position = "absolute";
    box.style.pointerEvents = "none";
    box.style.opacity = "0.2";

    box.style.border = "3px dashed var(--mui-palette-text-primary)";
    box.style.backgroundColor = "var(--mui-palette-text-disabled)";
    box.style.backgroundImage = `repeating-linear-gradient(
      45deg,
      var(--mui-palette-text-secondary) 0px,
      var(--mui-palette-text-secondary) ${stripeGap}px,
      transparent ${stripeGap}px,
      transparent ${stripeSize}px
    )`;

    boxContainer.appendChild(box);
  };

  const handleDraw = ({ clientX, clientY }: { clientX: number; clientY: number }) => {
    const { x: currentX, y: currentY } = relativeToContainer({ x: clientX, y: clientY });

    const left = Math.min(startX, currentX);
    const right = Math.max(startX, currentX);
    const top = Math.min(startY, currentY);
    const bottom = Math.max(startY, currentY);

    box.style.left = `${left}px`;
    box.style.right = `${boxContainer.clientWidth - right}px`;
    box.style.top = `${top}px`;
    box.style.bottom = `${boxContainer.clientHeight - bottom}px`;
  };

  const handleDrawEnd = () => {
    box.remove();
  };

  return { handleDrawStart, handleDraw, handleDrawEnd };
}

/**
 * 處理開始拖動某一資料列的事件
 */
const handleDragStart = (e: DragEvent) => {
  const index = getIndexFromEvent(e);
  if (index === null) return;

  const row = viewDataStore.getState().entries[index];
  if (!row) return;

  const { fileName, filePath, fileType } = row;
  const { selected } = selectionStore.getState();
  const isRowSelected = selected[index];

  // 若拖動的資料列是檔案或檔案符號連結，且該列已被選取，則啟動檔案拖放操作
  // 否則，若是左鍵點擊，則啟動框選操作
  if (["file", "file-symlink-file"].includes(fileType) && isRowSelected) {
    startFileDrag({ e, fileName, filePath });
  } else if (e.button === 0) {
    e.preventDefault();

    const boxContainer = document.getElementById(tableBodyVirtualListContainerId);
    if (!boxContainer) return;

    const { handleDrawStart, handleDraw, handleDrawEnd } = createHandleDrawBox({
      boxContainer,
      startX: e.clientX,
      startY: e.clientY,
    });

    handleDrawStart();

    let stopFlag = false;
    const position = { clientX: e.clientX, clientY: e.clientY };

    const handleUpdate = () => {
      if (stopFlag) return;
      handleDraw({ ...position });
      requestAnimationFrame(handleUpdate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      position.clientX = e.clientX;
      position.clientY = e.clientY;
    };

    const handleMouseUp = () => {
      stopFlag = true;
      handleDrawEnd();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("blur", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("blur", handleMouseUp);
    requestAnimationFrame(handleUpdate);
  }
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
