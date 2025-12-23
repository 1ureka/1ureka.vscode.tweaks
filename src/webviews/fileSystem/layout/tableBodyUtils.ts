import { useCallback, useEffect, useReducer } from "react";
import { clamp } from "@/utils";
import { RAFEventAggregator } from "@@/fileSystem/layout/imageGridUtils";
import { tableBodyContainerId } from "@@/fileSystem/layout/TableBody";
import { tableRowHeight } from "@@/fileSystem/layout/tableConfig";

// ---------------------------------------------------------------------------------

/**
 * 超出可視範圍的緩衝區比例
 */
const OVERSCAN_RATIO = 0.35;

/**
 *
 */
function getVisibleItems(params: { scrollContainer: HTMLElement; rowHeight: number; count: number }) {
  const { scrollContainer, rowHeight, count } = params;

  if (count <= 0) {
    return [];
  }

  const scrollTop = scrollContainer.scrollTop;
  const containerHeight = scrollContainer.clientHeight;

  const visibleCount = Math.ceil(containerHeight / rowHeight);
  const overscanCount = Math.max(1, Math.floor(visibleCount * OVERSCAN_RATIO));

  const minIndex = 0;
  const maxIndex = count - 1;

  const visibleStartIndex = Math.floor(scrollTop / rowHeight);
  const visibleEndIndex = Math.ceil((scrollTop + containerHeight) / rowHeight);

  const startIndex = clamp({
    value: visibleStartIndex - overscanCount,
    interval: [minIndex, maxIndex],
  });

  const endIndex = clamp({
    value: visibleEndIndex + overscanCount,
    interval: [minIndex, maxIndex],
  });

  const size = endIndex - startIndex + 1;
  const result = new Array(size); // 預先配置固定大小的記憶體空間

  for (let i = 0; i < size; i++) {
    const currentIndex = startIndex + i;
    result[i] = {
      key: currentIndex,
      size: rowHeight,
      start: currentIndex * rowHeight,
      index: currentIndex,
    };
  }

  return result as Array<{ key: number; size: number; start: number; index: number }>;
}

// ---------------------------------------------------------------------------------

/**
 *
 */
const getScrollContainer = () => {
  return document.getElementById(tableBodyContainerId);
};

/**
 * 自動監聽容器滾動與視窗縮放，並透過 RAF 聚合器優化效能，回傳可見項目清單與總高度
 * 使用該 hook 後，當發生滾動或視窗縮放時，最高峰每秒會有 20 次的重新計算與渲染
 */
const useTableBodyVirtualizer = ({ count }: { count: number }) => {
  /** */
  const rerender = useReducer(() => ({}), {})[1];

  /**
   *
   */
  const getVirtualItems = useCallback(() => {
    const scrollContainer = getScrollContainer();
    if (!scrollContainer) return [];

    return getVisibleItems({ scrollContainer, rowHeight: tableRowHeight, count });
  }, [count]);

  /**
   *
   */
  const getTotalSize = useCallback(() => {
    return tableRowHeight * count;
  }, [count]);

  /**
   *
   */
  useEffect(() => {
    const scrollContainer = getScrollContainer();
    if (!scrollContainer) return;

    const aggregator = new RAFEventAggregator(rerender, { fps: 30, idleTimeout: 500 });
    const handleEvent = () => aggregator.update();

    scrollContainer.addEventListener("scroll", handleEvent, { passive: true });
    window.addEventListener("resize", handleEvent);

    return () => {
      scrollContainer.removeEventListener("scroll", handleEvent);
      window.removeEventListener("resize", handleEvent);
      aggregator.dispose();
    };
  }, []);

  return { getVirtualItems, getTotalSize };
};

// ---------------------------------------------------------------------------------

export { useTableBodyVirtualizer };
