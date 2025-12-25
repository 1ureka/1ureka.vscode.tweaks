import { memo, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Box, Typography, type SxProps } from "@mui/material";

import { tableAlternateBgcolor, tableClass, tableId } from "@explorer/layout-table/config";
import { tableRowHeight, tableIconWidth, tableIconFontSize } from "@explorer/layout-table/config";
import { TableRow } from "@explorer/layout-table/TableRow";

import { loadingStore } from "@explorer/store/queue";
import { viewDataStore, viewStateStore } from "@explorer/store/data";
import { registerTableBodyEventHandlers } from "@explorer/action/table";

// ---------------------------------------------------------------------------------

/**
 * 用於在沒有任何項目時顯示訊息
 */
const NoItemDisplay = () => {
  const loading = loadingStore((state) => state.loading);
  const filter = viewStateStore((state) => state.filter);

  let noItemMessage = "此資料夾是空的";

  if (loading) {
    noItemMessage = "載入中...";
  } else if (filter === "file") {
    noItemMessage = "此資料夾中沒有檔案";
  } else if (filter === "folder") {
    noItemMessage = "此資料夾中沒有資料夾";
  }

  return (
    <Typography className={`${tableClass.rowCell} align-center secondary`} component="span" variant="caption">
      {noItemMessage}
    </Typography>
  );
};

// ---------------------------------------------------------------------------------

/**
 * ### 表格背景設計
 *
 * 1. 背景由容器繪製，而非子元素。這確保了即便資料列數較少時，斑馬紋依然能鋪滿整個視圖空間。
 *
 * 2. 不使用 background-attachment: local 改用「預設背景 + CSS 變數同步」是為了避免 Scrollbar Gutter 區域出現空白 (沒有斑馬背景)。
 *
 * 3. Row 元件無需維護 index 或 nth-child 狀態，對於虛擬列表 (Virtual List) 或排序功能具有極佳的適配性與效能表現。
 */
const tableBackgroundSx: SxProps = {
  backgroundImage: `linear-gradient(var(--mui-palette-background-content) 50%, ${tableAlternateBgcolor} 50%)`,
  backgroundSize: `100% ${tableRowHeight * 2}px`,
  backgroundRepeat: "repeat",
  backgroundPositionY: "var(--scroll-top, 0px)",
};

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
          <NoItemDisplay />
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
