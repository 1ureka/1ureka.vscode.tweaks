import { memo, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Box, Typography, type SxProps } from "@mui/material";

import { colorMix } from "@/utils/ui";
import { tableRowHeight } from "@@/fileSystem/layout/tableConfig";
import { TableRow, tableRowClassName, tableRowIndexAttr } from "@@/fileSystem/layout/TableRow";

import { viewDataStore, viewStateStore } from "@@/fileSystem/store/data";
import { fileSystemLoadingStore } from "@@/fileSystem/store/queue";

import { navigateToFolder } from "@@/fileSystem/action/navigation";
import { selectRow } from "@@/fileSystem/action/selection";
import { openFile, startFileDrag } from "@@/fileSystem/action/operation";

/**
 * 用於標識表格主體容器的唯一 ID，補充 1. 已經保證每次只會有一個存在 2. 這是寫在模組層，因此不會有重渲染導致 ID 變化的問題
 */
const tableBodyContainerId = "table-body" + crypto.randomUUID().slice(0, 8);

/**
 * 表格交替背景色
 */
const tableAlternateBgcolor = colorMix("background.content", "text.primary", 0.98);

/**
 * ### 表格背景設計
 *
 * 1. 背景由容器繪製，而非子元素。這確保了即便資料列數較少時，斑馬紋依然能鋪滿整個視圖空間。
 *
 * 2. 不使用 background-attachment: local 改用「預設背景 + CSS 變數同步」是為了避免 Scrollbar Gutter 區域出現空白 (沒有斑馬背景)。
 *
 * 3. Row 元件無需維護 index 或 nth-child 狀態，對於虛擬列表 (Virtual List) 或排序功能具有極佳的適配性與效能表現。
 */
const tableBodyContainerSx: SxProps = {
  flex: 1,
  overflowY: "auto",
  scrollbarGutter: "stable",
  minHeight: 0,
  borderRadius: 1,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  backgroundImage: `linear-gradient(var(--mui-palette-background-content) 50%, ${tableAlternateBgcolor} 50%)`,
  backgroundSize: `100% ${tableRowHeight * 2}px`,
  backgroundRepeat: "repeat",
  backgroundPositionY: "var(--scroll-top, 0px)",
};

/**
 * 用於呈現表格主體的容器組件
 */
const TableBodyContainer = ({ children }: { children: React.ReactNode }) => {
  const handleScroll = () => {
    const container = document.getElementById(tableBodyContainerId);
    if (container) {
      const scrollTop = container.scrollTop;
      container.style.setProperty("--scroll-top", `${-scrollTop}px`);
    }
  };

  return (
    <Box id={tableBodyContainerId} onScroll={handleScroll} sx={tableBodyContainerSx}>
      {children}
    </Box>
  );
};

// ---------------------------------------------------------------------------------

/**
 * 用於在沒有任何項目時顯示訊息
 */
const NoItemDisplay = () => {
  const loading = fileSystemLoadingStore((state) => state.loading);
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
    <Box sx={{ display: "grid", placeItems: "center", height: tableRowHeight }}>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {noItemMessage}
      </Typography>
    </Box>
  );
};

// ---------------------------------------------------------------------------------

/**
 * 用於虛擬化渲染整個列表的容器樣式 (也就是有著整個列表總高度的容器)
 */
const virtualItemListWrapperSx: SxProps = {
  position: "relative",
  width: 1,
  transition: "opacity 0.05s step-end", // 所有小於 50ms 的載入時間都不顯示載入回饋，以避免閃爍
};

/**
 * 用於虛擬化渲染/定位單一項目的容器樣式
 */
const virtualItemWrapperSx: SxProps = {
  position: "absolute",
  top: 0,
  left: 0,
  width: 1,
};

/**
 * 專注於用虛擬化渲染表格主體中的所有資料列
 */
const TableBodyVirtualRows = () => {
  const viewEntries = viewDataStore((state) => state.entries);
  const loading = fileSystemLoadingStore((state) => state.loading);

  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => document.getElementById(tableBodyContainerId),
    count: viewEntries.length,
    estimateSize: () => tableRowHeight,
    overscan: 1,
  });

  const virtualItemListWrapperStyle: React.CSSProperties = {
    height: `${rowVirtualizer.getTotalSize()}px`,
    opacity: loading ? 0.5 : 1,
  };

  return (
    <Box sx={virtualItemListWrapperSx} style={virtualItemListWrapperStyle}>
      {viewEntries.length === 0 && (
        <Box sx={virtualItemWrapperSx} style={{ height: `${tableRowHeight}px`, transform: `translateY(0px)` }}>
          <NoItemDisplay />
        </Box>
      )}

      {rowVirtualizer.getVirtualItems().map(({ key, size, start, index }) => (
        <Box key={key} sx={virtualItemWrapperSx} style={{ height: `${size}px`, transform: `translateY(${start}px)` }}>
          <TableRow index={index} />
        </Box>
      ))}
    </Box>
  );
};

// ---------------------------------------------------------------------------------

/**
 * 根據點擊事件獲取對應的資料列索引
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
 * ?
 */
const TableBody = memo(() => {
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

  return (
    <TableBodyContainer>
      <TableBodyVirtualRows />
    </TableBodyContainer>
  );
});

export { TableBody };
