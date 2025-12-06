import React from "react";
import { Box } from "@mui/material";
import { toggleBoxSelectionMode, useIsBoxSelecting } from "@/webviews/fileSystem/data/selection";
import { tableRowHeight } from "@/webviews/fileSystem/table/FileSystemTableRow";
import { fileSystemViewDataStore } from "../data/view";

const ROW_HEIGHT = tableRowHeight;
const ROW_GAP = 4;
const ROW_TOTAL_HEIGHT = ROW_HEIGHT + ROW_GAP;

/**
 * 根據滑鼠位置自動滾動容器
 * @param scrollContainer 要滾動的目標容器
 */
function handleAutoScroll(clientY: number, scrollContainer: HTMLElement) {
  const scrollThreshold = 100; // 距離邊緣多少像素開始滾動
  const maxScrollSpeed = 30; // 最大滾動速度 (像素/幀)
  const accelerationPower = 2; // 加速曲線的次方數 (P > 1 產生加速效果)

  // 作為邊界的定義，比如若果是 window，則判斷標準就是游標與視窗邊緣的距離
  const containerRect = scrollContainer.getBoundingClientRect();
  const distanceFromTopEdge = clientY - containerRect.top;
  const distanceFromBottomEdge = containerRect.bottom - clientY;

  let scrollSpeed = 0;

  // --- 向上滾動 ---
  if (distanceFromTopEdge < scrollThreshold) {
    // 從 [0, scrollThreshold] 映射到 [0, 1] 的比例 (0 在邊緣, 1 在閾值邊界)
    const normalizedDistance = distanceFromTopEdge / scrollThreshold;

    // 計算速度比例 (1 - normalizedDistance) 從 1 (邊緣) 降到 0 (閾值邊界)
    // 使用 Math.pow 進行非線性加速：
    // 當 normalizedDistance 接近 0 (靠近邊緣) 時，ratio 接近 1^P = 1
    // 當 normalizedDistance 接近 1 (遠離邊緣) 時，ratio 接近 0^P = 0
    const ratio = Math.pow(1 - normalizedDistance, accelerationPower);
    scrollSpeed = ratio * maxScrollSpeed;
    scrollContainer.scrollTop -= scrollSpeed;
  }
  // --- 向下滾動 ---
  else if (distanceFromBottomEdge < scrollThreshold) {
    const normalizedDistance = distanceFromBottomEdge / scrollThreshold;
    const ratio = Math.pow(1 - normalizedDistance, accelerationPower);
    scrollSpeed = ratio * maxScrollSpeed;
    scrollContainer.scrollTop += scrollSpeed;
  }
}

/**
 * 獲取當前選擇狀態後，根據框選區域計算新的選擇狀態，並觸發狀態更新
 */
function createHandleCaculateSelection({ rowsContainer, clientY }: { rowsContainer: HTMLElement; clientY: number }) {
  const relativeToRowsTop = (currentY: number) => currentY - rowsContainer.getBoundingClientRect().top;
  const normalizedStartY = relativeToRowsTop(clientY);

  return (currentY: number) => {
    const normalizedCurrentY = relativeToRowsTop(currentY);
    const newSelected = [...fileSystemViewDataStore.getState().selected];

    for (let index = 0; index < newSelected.length; index++) {
      // 計算當前行的 Y 座標範圍
      const rowTop = index * ROW_TOTAL_HEIGHT;
      const rowBottom = rowTop + ROW_HEIGHT;
      // 判斷是否與框選區域相交
      const boxTop = Math.min(normalizedStartY, normalizedCurrentY);
      const boxBottom = Math.max(normalizedStartY, normalizedCurrentY);
      const intersects = !(boxBottom < rowTop || boxTop > rowBottom);

      newSelected[index] = intersects ? 1 : 0;
    }

    fileSystemViewDataStore.setState({ selected: newSelected });
  };
}

type CreateHandleUpdateBoxParams = {
  overlay: HTMLElement;
  overlayContainer: HTMLElement;
  clientX: number;
  clientY: number;
};

/**
 * 根據起始點創建更新框選框位置的函式
 */
function createHandleUpdateBox(params: CreateHandleUpdateBoxParams) {
  const { overlay, overlayContainer, clientX, clientY } = params;

  const relativeToScrollContainer = ({ x, y }: { x: number; y: number }) => {
    const rect = overlayContainer.getBoundingClientRect();
    return { x: x - rect.left, y: y - rect.top };
  };

  const normalizedStart = relativeToScrollContainer({ x: clientX, y: clientY });
  const normalizedStartX = normalizedStart.x;
  const normalizedStartY = normalizedStart.y;

  return ({ clientX, clientY }: { clientX: number; clientY: number }) => {
    const normalizedCurrent = relativeToScrollContainer({ x: clientX, y: clientY });
    const normalizedCurrentX = normalizedCurrent.x;
    const normalizedCurrentY = normalizedCurrent.y;

    const left = Math.min(normalizedStartX, normalizedCurrentX);
    const right = Math.max(normalizedStartX, normalizedCurrentX);
    const top = Math.min(normalizedStartY, normalizedCurrentY);
    const bottom = Math.max(normalizedStartY, normalizedCurrentY);

    overlay.style.left = `${left}px`;
    overlay.style.right = `${overlayContainer.clientWidth - right}px`;
    overlay.style.top = `${top}px`;
    overlay.style.bottom = `${overlayContainer.clientHeight - bottom}px`;
  };
}

const handleMouseDown = (e: React.MouseEvent) => {
  // 只處理左鍵
  if (e.button !== 0) return;

  // 獲取相關容器元素與邊界資訊
  const overlayContainer = document.getElementById("file-system-box-selection-overlay-wrapper");
  const overlay = document.getElementById("file-system-box-selection-overlay");
  const scrollContainer = document.getElementById("file-system-body-wrapper");
  const rowsContainer = document.getElementById("file-system-virtualizer");
  if (!scrollContainer || !rowsContainer || !overlayContainer || !overlay) return;

  // ------------------------------------------------------------------------

  // 紀錄當前起始 Y 座標，並開始監聽滑鼠移動與放開事件，進行框選邏輯

  const handleUpdateBox = createHandleUpdateBox({
    overlay,
    overlayContainer,
    clientX: e.clientX,
    clientY: e.clientY,
  });

  const handleCaculateSelection = createHandleCaculateSelection({
    rowsContainer,
    clientY: e.clientY,
  });

  let stopFlag = false;
  let clientX = e.clientX;
  let clientY = e.clientY;

  const handleUpdate = () => {
    if (stopFlag) return;
    handleAutoScroll(clientY, scrollContainer);
    handleCaculateSelection(clientY);
    handleUpdateBox({ clientX, clientY });
    requestAnimationFrame(handleUpdate);
  };

  const handleMouseMove = (event: MouseEvent) => {
    clientX = event.clientX;
    clientY = event.clientY;
  };

  const handleMouseUp = () => {
    stopFlag = true;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    toggleBoxSelectionMode(false);
  };

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
  requestAnimationFrame(handleUpdate);
};

/** 該組件應該要作為 scrollContainer 的子元素，並且排在其所有子元素的後面確保覆蓋 */
const BoxSelectionOverlay = () => {
  const isBoxSelecting = useIsBoxSelecting();

  if (!isBoxSelecting) return null;

  return (
    <Box
      id="file-system-box-selection-overlay-wrapper"
      sx={{ position: "absolute", inset: 0, pointerEvents: "auto", cursor: "crosshair", overflow: "hidden" }}
      onMouseDown={handleMouseDown}
    >
      <Box
        id="file-system-box-selection-overlay"
        sx={{
          position: "absolute",
          border: "2px solid var(--vscode-button-background)",
          backgroundColor: "color-mix(in srgb, var(--vscode-button-background) 15%, transparent)",
          pointerEvents: "none",
        }}
      />
    </Box>
  );
};

export { BoxSelectionOverlay };
