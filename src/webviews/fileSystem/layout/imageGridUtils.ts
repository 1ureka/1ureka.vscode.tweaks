import { useEffect, useState } from "react";

type RAFOptions = {
  fps?: number; // 目標幀率，例如 30
  idleTimeout?: number; // 空閒超時毫秒數，預設為 500ms
};

/**
 * 用於表示緩衝區為空（尚未接收到新數據）的內部標記
 */
const EMPTY = Symbol("empty");

/**
 * 基於 requestAnimationFrame 的事件聚合器
 * 用於將高頻率事件（如滾動、調整大小）聚合並限制回調執行頻率
 * 會在設置的空閒超時後自動停止 tick 循環
 */
class RAFEventAggregator<T = undefined> {
  private dataBuffer: T | typeof EMPTY = EMPTY; // 最新一次 update
  private lastRunTime = 0;
  private lastUpdateTime = 0;
  private rafId: number | null = null;
  private interval: number;
  private idleTimeout: number;

  constructor(private callback: (data: T) => void, options: RAFOptions = {}) {
    // 計算每幀應該間隔的毫秒數
    this.interval = 1000 / (options.fps || 60);
    this.idleTimeout = options.idleTimeout ?? 500;
  }

  /**
   * 供事件源調用的更新方法
   */
  public update(...args: undefined extends T ? [value?: T] : [value: T]) {
    const value = args[0] as T;

    this.lastUpdateTime = performance.now();
    this.dataBuffer = value;

    // 如果還沒啟動 RAF，則啟動
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  }

  private tick = (timestamp: number) => {
    const elapsed = timestamp - this.lastRunTime;

    if (elapsed >= this.interval) {
      // 只有當快取中有數據時才執行
      if (this.dataBuffer !== EMPTY) {
        this.callback(this.dataBuffer);

        // 執行後清空快照，避免重複處理舊數據
        this.dataBuffer = EMPTY;
        this.lastRunTime = timestamp;
      }
    }

    if (timestamp - this.lastUpdateTime >= this.idleTimeout) {
      // 超過空閒超時，停止循環
      this.dispose();
      return;
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  /**
   * 停止監聽與循環
   */
  public dispose() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

export { RAFEventAggregator };

// ---------------------------------------------------------------------------------

/** 定義帶有寬高屬性的基本物件介面 */
type ItemWithSize = {
  width: number;
  height: number;
};

/** 描述單個項目在軌道中的垂直位置資訊，包含原始資料與起始/結束的權重座標 */
type TrackItem<T> = {
  item: T;
  yStart: number;
  yEnd: number;
};

/** 多軌道佈局結構，是一個二維陣列，第一層為欄位（軌道），第二層為該欄位內的有序項目 */
type Tracks<T> = TrackItem<T>[][];

/** 應由其他模組實作計算的完整的軌道分配結果，包含所有軌道的數據以及整體佈局的最大權重高度 */
type Layout<T> = {
  tracks: Tracks<T>;
  yMax: number;
};

/** 指向滾動容器 HTML 元素的 React Ref 物件類型 */
type ScrollContainerRef = React.RefObject<HTMLDivElement | null>;

/** 經過虛擬化計算後，帶有最終渲染像素座標（X, Y）與尺寸（W, H）的完整項目資料 */
type VirtualizedItem<T> = T & {
  pixelX: number;
  pixelY: number;
  pixelW: number;
  pixelH: number;
};

// ---------------------------------------------------------------------------------

/**
 * 根據當前容器滾動位置、像素大小，利用二分搜尋從佈局資料中篩選出可見範圍內的項目並轉換為像素座標
 */
function getVirtualizedItems<T extends ItemWithSize>(params: { scrollContainer: HTMLElement } & Layout<T>) {
  const { scrollContainer, tracks, yMax } = params;

  const scrollTop = scrollContainer.scrollTop;
  const containerHeight = scrollContainer.clientHeight;
  const containerWidth = scrollContainer.clientWidth;

  const k = containerWidth / tracks.length; // 權重單位轉像素的係數

  const totalHeight = yMax * k; // 整個列表的總高度 (像素)
  const vStart = scrollTop / k; // 視窗頂端的權重位置
  const vEnd = (scrollTop + containerHeight) / k; // 視窗底端的權重位置

  const visibleItems: VirtualizedItem<T>[] = [];

  tracks.forEach((track, colIndex) => {
    // 在這一個欄位(軌道)中使用二分搜尋，找到第一個可能可見的項目 (yEnd > vStart)
    let low = 0;
    let high = track.length - 1;
    let firstVisibleIdx = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      // 若果 mid 項目的結束位置在視窗頂端之下，表示它可能是可見項目或可見項目底下的項目
      // 因此將 high 移到 mid - 1，繼續往上搜尋 (aka 確保它是第一個可見項目)
      // 否則代表 mid 項目在視窗頂端之上，將 low 移到 mid + 1，繼續往下搜尋 (aka 可見項目在它下面)
      if (track[mid].yEnd > vStart) {
        firstVisibleIdx = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    if (firstVisibleIdx < 0) {
      return; // 此欄位中沒有可見項目
    }

    // 從第一個可見項目開始向後遍歷，直到 yStart 越過視窗底端
    for (let i = firstVisibleIdx; i < track.length; i++) {
      const trackItem = track[i];
      if (trackItem.yStart > vEnd) break;

      visibleItems.push({
        ...trackItem.item,
        // 最終渲染座標變換
        pixelX: colIndex * k,
        pixelY: trackItem.yStart * k,
        pixelW: k,
        pixelH: (trackItem.yEnd - trackItem.yStart) * k,
      });
    }
  });

  return { visibleItems, totalHeight };
}

// ---------------------------------------------------------------------------------

/**
 * 自動監聽容器滾動與視窗縮放，並透過 RAF 聚合器優化效能，回傳可見項目清單與總高度
 * 使用該 hook 後，當發生滾動或視窗縮放時，最高峰每秒會有 20 次的重新計算與渲染
 */
const useVirtualizer = <T extends ItemWithSize>(params: { scrollContainerRef: ScrollContainerRef } & Layout<T>) => {
  const { scrollContainerRef, tracks, yMax } = params;

  const [visibleItems, setVisibleItems] = useState<VirtualizedItem<T>[]>([]);
  const [totalHeight, setTotalHeight] = useState(0);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;

    const handleUpdate = () => {
      const { visibleItems, totalHeight } = getVirtualizedItems({ tracks, yMax, scrollContainer: container });
      setVisibleItems(visibleItems);
      setTotalHeight(totalHeight);
    };

    const aggregator = new RAFEventAggregator(handleUpdate, {
      fps: 20, // 因為該計算只牽扯顯示或隱藏元素，不是跟隨滑鼠移動等視覺上容易發現的事件，所以 20 FPS 已經足夠流暢
      idleTimeout: 500,
    });

    const handleEvent = () => {
      aggregator.update();
    };

    handleEvent();
    container.addEventListener("scroll", handleEvent, { passive: true });
    window.addEventListener("resize", handleEvent);

    return () => {
      container.removeEventListener("scroll", handleEvent);
      window.removeEventListener("resize", handleEvent);
      aggregator.dispose();
    };
  }, [scrollContainerRef, tracks, yMax]);

  return { visibleItems, totalHeight };
};

// ---------------------------------------------------------------------------------

export { useVirtualizer };
