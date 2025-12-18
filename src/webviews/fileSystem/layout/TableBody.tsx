import { memo, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Box, ButtonBase, Typography, type SxProps } from "@mui/material";

import { extensionIconMap } from "@/assets/fileExtMap";
import { colorMix, ellipsisSx } from "@/utils/ui";
import { formatFileSize, formatFileType, formatFixedLengthDateTime } from "@/utils/formatter";
import { tableColumns, tableIconFontSize, tableIconWidth, tableRowHeight } from "@@/fileSystem/layout/tableConfig";
import type { TableColumn } from "@@/fileSystem/layout/tableConfig";
import type { InspectDirectoryEntry } from "@/utils/system";

import { clipboardStore, selectionStore, viewDataStore, viewStateStore } from "@@/fileSystem/store/data";
import { fileSystemLoadingStore } from "@@/fileSystem/store/queue";

import { navigateToFolder } from "@@/fileSystem/action/navigation";
import { selectRow } from "@@/fileSystem/action/selection";
import { openFile, startFileDrag } from "@@/fileSystem/action/operation";

const tableBodyContainerId = "table-body" + crypto.randomUUID().slice(0, 8);

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
 * 用於表格某 row 中的單元格的樣式
 */
const tableRowCellSx: SxProps = {
  minWidth: 0,
  display: "flex",
  alignItems: "center",

  "&.align-left": { justifyContent: "flex-start" },
  "&.align-center": { justifyContent: "center" },
  "&.align-right": { justifyContent: "flex-end" },

  "& > span": { ...ellipsisSx, whiteSpace: "pre" },
  "& > span.primary": { color: "text.primary" },
  "& > span.secondary": { color: "text.secondary" },
} as SxProps;

/**
 * 用於表格某 row 中的單元格
 */
const TableCell = (props: { text: string; variant: "primary" | "secondary"; column: TableColumn }) => {
  const { text, variant } = props;
  const { align, weight, width } = props.column;

  const layoutStyle: React.CSSProperties = width ? { width } : { flex: weight };

  return (
    <Box style={layoutStyle} sx={tableRowCellSx} className={`align-${align}`}>
      <Typography component="span" variant="caption" className={variant}>
        {text}
      </Typography>
    </Box>
  );
};

// ---------------------------------------------------------------------------------

/**
 * 用於正存在剪貼簿中的 row 的虛線邊框樣式
 */
const tableRowClipboardBorderSx: SxProps = {
  "& > rect": {
    stroke: "var(--mui-palette-text-primary)",
    strokeOpacity: 0.2,
    strokeWidth: 1.5,
    strokeDasharray: "14 8",
    fill: "none",
    animation: "dash 2s linear infinite",
    rx: "var(--mui-shape-borderRadius)",
    ry: "var(--mui-shape-borderRadius)",
  },

  "@keyframes dash": { to: { strokeDashoffset: -110 } },
};

/**
 * 用於給正存在剪貼簿中的 row 提供虛線邊框動畫
 */
const TableRowBorder = memo(() => (
  <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <Box component="svg" preserveAspectRatio="none" width="100%" height="100%" sx={tableRowClipboardBorderSx}>
      <rect width="calc(100%)" height="calc(100%)" />
    </Box>
  </Box>
));

// ---------------------------------------------------------------------------------

/**
 * 為項目指派對應的圖示
 */
const assignIcon = (entry: InspectDirectoryEntry) => {
  let icon: `codicon codicon-${string}` = `codicon codicon-${entry.fileType}`;

  if (entry.fileType !== "file") return { ...entry, icon };

  const fileName = entry.fileName.toLowerCase();
  const extension = fileName.includes(".") ? fileName.split(".").pop() || "" : "";

  if (extension in extensionIconMap) {
    icon = extensionIconMap[extension];
  }

  return { ...entry, icon };
};

/**
 * 用於表格中每一列的樣式
 */
const tableRowSx: SxProps = {
  position: "relative",
  width: 1,
  height: tableRowHeight,
  display: "flex",
  alignItems: "stretch",
  justifyContent: "stretch",
  px: 0.5,
  overflow: "visible",
  "&.selected": { bgcolor: "action.active" },
};

/**
 * 用於呈現一個普通的資料列
 */
const TableRow = memo(({ index }: { index: number }) => {
  const viewEntries = viewDataStore((state) => state.entries);
  const selected = selectionStore((state) => state.selected);
  const clipboardEntries = clipboardStore((state) => state.entries);

  const row = assignIcon(viewEntries[index]);

  const isInClipboard = row.filePath in clipboardEntries;
  const className = selected[index] ? `selected table-row` : `table-row`;
  const draggable = row.fileType === "file";

  return (
    <ButtonBase focusRipple sx={tableRowSx} className={className} data-index={index} draggable={draggable}>
      <Box sx={{ width: tableIconWidth, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <i className={row.icon} style={{ display: "flex", alignItems: "center", fontSize: tableIconFontSize }} />
      </Box>

      {tableColumns.map((column) => {
        const { field } = column;
        const textVariant = field === "fileName" ? "primary" : "secondary";
        let formatted: string;

        if (field === "fileType") {
          formatted = formatFileType({ fileName: row.fileName, fileType: row.fileType });
        } else if (field === "ctime") {
          formatted = formatFixedLengthDateTime(new Date(row.ctime));
        } else if (field === "mtime") {
          formatted = formatFixedLengthDateTime(new Date(row.mtime));
        } else if (field === "size") {
          formatted = row.fileType === "file" ? formatFileSize(row.size) : "";
        } else {
          formatted = String(row[field]);
        }

        return <TableCell key={field} variant={textVariant} text={formatted} column={column} />;
      })}

      {isInClipboard && <TableRowBorder />}
    </ButtonBase>
  );
});

// ---------------------------------------------------------------------------------

/**
 * 專注於用虛擬化渲染表格主體中的所有資料列
 */
const TableBodyRows = () => {
  const viewEntries = viewDataStore((state) => state.entries);
  const filter = viewStateStore((state) => state.filter);
  const loading = fileSystemLoadingStore((state) => state.loading);

  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => document.getElementById(tableBodyContainerId),
    count: viewEntries.length,
    estimateSize: () => tableRowHeight,
    overscan: 1,
  });

  const virtualItemListWrapperSx: SxProps = {
    position: "relative",
    height: `${rowVirtualizer.getTotalSize()}px`,
    width: 1,
    transition: "opacity 0.05s step-end", // 所有小於 50ms 的載入時間都不顯示載入回饋，以避免閃爍
  };

  const virtualItemWrapperSx: SxProps = {
    position: "absolute",
    top: 0,
    left: 0,
    width: 1,
  };

  let noItemMessage = "此資料夾是空的";

  if (loading) {
    noItemMessage = "載入中...";
  } else if (filter === "file") {
    noItemMessage = "此資料夾中沒有檔案";
  } else if (filter === "folder") {
    noItemMessage = "此資料夾中沒有資料夾";
  }

  return (
    <Box sx={virtualItemListWrapperSx} style={loading ? { opacity: 0.5 } : undefined}>
      {viewEntries.length === 0 && (
        <Box sx={virtualItemWrapperSx} style={{ height: `${tableRowHeight}px`, transform: `translateY(0px)` }}>
          <Box sx={{ display: "grid", placeItems: "center", height: tableRowHeight }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {noItemMessage}
            </Typography>
          </Box>
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

  const indexStr = target.closest(".table-row")?.getAttribute("data-index");
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
const TableBody = () => {
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
      <TableBodyRows />
    </TableBodyContainer>
  );
};

export { TableBody };
