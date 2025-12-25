import { memo, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Box, keyframes, type SxProps } from "@mui/material";

import { tableAlternateBgcolor, tableClass, tableId } from "@explorer/layout-table/config";
import { tableRowHeight, tableIconWidth, tableIconFontSize } from "@explorer/layout-table/config";
import { TableRow, TableRowNoItem } from "@explorer/layout-table/TableRow";

import { loadingStore } from "@explorer/store/queue";
import { viewDataStore } from "@explorer/store/data";
import { registerTableBodyEventHandlers } from "@explorer/action/table";

/**
 * ### 表格背景設計
 *
 * 1. 確保即便資料列數較少時，斑馬紋依然能鋪滿整個視圖空間。
 *
 * 2. 配合全局透明 Gutter ，由於背景繪製在 scroll 容器本身，因此條紋會穿透至捲軸下方，模擬行動端無縫捲動體驗。
 *
 * 3. Row 元件無需 nth-child 狀態，對於虛擬列表 (Virtual List) 或排序功能具有極佳的適配性與效能表現。
 *
 * 4. 在快速捲動或資料加載時，斑馬紋始終作為「視覺佔位符」存在，根本上解決虛擬化後的白塊問題。
 */
const tableBackgroundSx: SxProps = {
  backgroundImage: `linear-gradient(var(--mui-palette-background-content) 50%, ${tableAlternateBgcolor} 50%)`,
  backgroundSize: `100% ${tableRowHeight * 2}px`,
  backgroundRepeat: "repeat",
  backgroundPositionY: "var(--scroll-top, 0px)",
};

/**
 * 用於為處在剪貼簿中的列提供背景動畫
 */
const clipboardAnimation = keyframes`
  0% { background-position: 0% 0%; }
  100% { background-position: 0px -${tableRowHeight}px; }
`;

/**
 * 整個表格主體組件的所有樣式，透過樣式委派傳遞
 */
const tableSx: SxProps = {
  flex: 1,
  overflowY: "auto",
  scrollbarGutter: "stable",
  minHeight: 0,
  borderRadius: 1,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  ...tableBackgroundSx,

  [`& #${tableId.rowsContainer}`]: {
    position: "relative",
    width: 1,
    opacity: 1,
    transition: "opacity 0.05s step-end", // 所有小於 50 ms 的載入時間都不顯示載入回饋，以避免閃爍
    "&.loading": { opacity: 0.5 },
  },

  [`& .${tableClass.rowWrapper}`]: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 1,
  },

  [`& .${tableClass.row}`]: {
    position: "relative",
    width: 1,
    height: tableRowHeight,
    overflow: "visible",
    px: 0.5,

    display: "flex",
    alignItems: "stretch",
    justifyContent: "stretch",

    "&.selected": { bgcolor: "action.active" },

    [`& .codicon[class*='codicon-']`]: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: tableIconWidth,
      fontSize: tableIconFontSize,
    },
  },

  [`& .${tableClass.rowCell}`]: {
    display: "block",
    lineHeight: `${tableRowHeight}px`,
    minWidth: 0,
    overflow: "hidden",
    whiteSpace: "pre",
    textOverflow: "ellipsis",

    "&.align-left": { textAlign: "left" },
    "&.align-center": { textAlign: "center" },
    "&.align-right": { textAlign: "right" },

    "&.primary": { color: "text.primary" },
    "&.secondary": { color: "text.secondary" },
  },

  [`& .${tableClass.rowClipboardOverlay}`]: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: -1,

    opacity: 0.35,
    animation: `${clipboardAnimation} 0.5s linear infinite`,
    backgroundSize: `${tableRowHeight}px ${tableRowHeight}px`,
    backgroundImage: `
      linear-gradient(
        45deg,
        var(--mui-palette-background-paper) 25%,
        transparent 25%,
        transparent 50%,
        var(--mui-palette-background-paper) 50%,
        var(--mui-palette-background-paper) 75%,
        transparent 75%,
        transparent 100%
      )
    `,
  },
};

// ---------------------------------------------------------------------------------

/** 獲取滾動容器 */
const getScrollElement = () => {
  return document.getElementById(tableId.scrollContainer);
};

/** 獲取每個虛擬項目的高度 */
const estimateSize = () => {
  return tableRowHeight;
};

/** 根據起始位置生成虛擬項目的內聯樣式 */
const getVirtualItemStyle = (start: number) => {
  return { height: `${tableRowHeight}px`, transform: `translateY(${start}px)` };
};

/**
 * 專注於用虛擬化渲染表格主體中的所有資料列
 */
const TableBodyVirtualRows = memo(() => {
  const viewEntries = viewDataStore((state) => state.entries);
  const rowVirtualizer = useVirtualizer({ getScrollElement, estimateSize, count: viewEntries.length, overscan: 1 });
  const virtualItemListWrapperStyle = { height: `${rowVirtualizer.getTotalSize()}px` };
  const loading = loadingStore((state) => state.loading);

  return (
    <div id={tableId.rowsContainer} className={loading ? "loading" : ""} style={virtualItemListWrapperStyle}>
      {viewEntries.length === 0 && (
        <div className={tableClass.rowWrapper} style={getVirtualItemStyle(0)}>
          <TableRowNoItem />
        </div>
      )}

      {rowVirtualizer.getVirtualItems().map(({ key, start, index }) => (
        <div key={key} className={tableClass.rowWrapper} style={getVirtualItemStyle(start)}>
          <TableRow index={index} />
        </div>
      ))}
    </div>
  );
});

// ---------------------------------------------------------------------------------

/**
 * 處理滾動事件，同步背景位置
 */
const handleScroll = () => {
  const container = document.getElementById(tableId.scrollContainer);
  if (container) {
    const scrollTop = container.scrollTop;
    container.style.setProperty("--scroll-top", `${-scrollTop}px`);
  }
};

/**
 * 表格主體組件
 */
const TableBody = memo(() => {
  const viewMode = viewDataStore((state) => state.viewMode);

  useEffect(() => {
    if (viewMode !== "directory") return;
    const dispose = registerTableBodyEventHandlers();
    return () => {
      dispose?.();
    };
  }, [viewMode]);

  if (viewMode !== "directory") {
    return null;
  }

  return (
    <Box id={tableId.scrollContainer} onScroll={handleScroll} sx={tableSx}>
      <TableBodyVirtualRows />
    </Box>
  );
});

export { TableBody };
