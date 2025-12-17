import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Box, ButtonBase, Typography, type SxProps } from "@mui/material";

import { colorMix, ellipsisSx } from "@/utils/ui";
import { formatFileSize, formatFileType, formatFixedLengthDateTime } from "@/utils/formatter";
import { tableColumns, tableIconFontSize, tableIconWidth, tableRowHeight } from "@@/fileSystem/layout/tableConfig";
import type { TableColumn } from "@@/fileSystem/layout/tableConfig";

import { fileSystemViewDataStore, fileSystemViewStore } from "@@/fileSystem/store/view";
import { fileSystemLoadingStore } from "@@/fileSystem/store/queue";
import { fileSystemClipboardStore } from "@@/fileSystem/store/other";

import { navigateToFolder } from "@@/fileSystem/action/navigation";
import { selectRow } from "@@/fileSystem/action/selection";
import { openFile } from "@@/fileSystem/action/operation";

const tableAlternateBgcolor = colorMix("background.content", "text.primary", 0.98);

/**
 * ### 表格背景設計
 *
 * 1. 視覺穩定性：
 *
 * 背景由容器繪製，而非子元素。這確保了即便資料列數較少時，斑馬紋依然能鋪滿整個視圖空間，
 * 避免了網頁常見的「底部斷層」感，達到類似 Blender 等專業軟體的 UI 質感。
 *
 * 2. 解決 Scrollbar Gutter 渲染問題：
 *
 * 不使用 background-attachment: local 是為了避免捲軸背景區域出現空白斷層 (沒有斑馬背景)。
 * 改用「預設背景 + CSS 變數同步」來達成完美的跨瀏覽器捲軸連貫性。
 *
 * 3. 開發解耦 (Decoupling)：
 *
 * Row 元件無需維護 index 或 nth-child 狀態，對於虛擬列表 (Virtual List) 或排序功能
 * 具有極佳的適配性與效能表現。
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
const TableBodyContainer = ({ children, ref }: { children: React.ReactNode; ref?: React.Ref<HTMLDivElement> }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      containerRef.current.style.setProperty("--scroll-top", `${-scrollTop}px`);
    }
  };

  const combinedRef = (node: HTMLDivElement | null) => {
    containerRef.current = node;

    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  return (
    <Box ref={combinedRef} onScroll={handleScroll} sx={tableBodyContainerSx}>
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
const TableRowBorder = () => (
  <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <Box component="svg" preserveAspectRatio="none" width="100%" height="100%" sx={tableRowClipboardBorderSx}>
      <rect width="calc(100%)" height="calc(100%)" />
    </Box>
  </Box>
);

// ---------------------------------------------------------------------------------

/**
 * 根據項目路徑和名稱創建拖放開始事件處理器
 */
const createHandleDragStart = (params: { filePath: string; fileName: string }) => {
  const { filePath, fileName } = params;

  const handler: React.DragEventHandler<HTMLButtonElement> = (e) => {
    const fileUrl = `file:///${filePath.replace(/\\/g, "/")}`;
    const mimeType = "application/octet-stream";
    const downloadURL = `${mimeType}:${fileName}:${fileUrl}`;

    e.dataTransfer.setData("DownloadURL", downloadURL);
    e.dataTransfer.setData("text/uri-list", fileUrl);
    e.dataTransfer.setData("application/vnd.code.uri-list", JSON.stringify([fileUrl]));
    e.dataTransfer.setData("codefiles", JSON.stringify([filePath]));
    e.dataTransfer.setData("resourceurls", JSON.stringify([fileUrl]));
    e.dataTransfer.effectAllowed = "copy";
  };

  return handler;
};

/**
 * 根據檔案類型和路徑創建點擊事件處理器
 */
const createHandleClick = (params: { fileType: string; filePath: string; index: number }) => {
  const { fileType, filePath, index } = params;

  return (e: React.MouseEvent<HTMLButtonElement>) => {
    selectRow({ index, isAdditive: e.ctrlKey || e.metaKey, isRange: e.shiftKey });

    if (e.detail !== 2) return;

    if (fileType === "folder" || fileType === "file-symlink-directory") {
      navigateToFolder({ dirPath: filePath });
    } else if (fileType === "file" || fileType === "file-symlink-file") {
      openFile(filePath);
    }
  };
};

/**
 * 根據項目創建右鍵點擊事件處理器，方便在右鍵選單重新命名、刪除時能夠選取該列
 */
const createHandleContextMenu = ({ index }: { index: number }) => {
  return () => {
    selectRow({ index, isAdditive: true, isRange: false, forceSelect: true });
  };
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
const TableRow = ({ index }: { index: number }) => {
  const viewEntries = fileSystemViewDataStore((state) => state.entries);
  const selected = fileSystemViewDataStore((state) => state.selected);
  const clipboardEntries = fileSystemClipboardStore((state) => state.entries);

  const row = viewEntries[index];
  const isInClipboard = row.filePath in clipboardEntries;
  const className = selected[index] ? "selected" : undefined;

  const isDraggable = row.fileType === "file";
  const draggableProps = isDraggable ? { draggable: true, onDragStart: createHandleDragStart(row) } : {};

  const handleClick = createHandleClick({ ...row, index });
  const handleContextMenu = createHandleContextMenu({ index });
  const pointerProps = { onClick: handleClick, onContextMenu: handleContextMenu };

  return (
    <ButtonBase focusRipple sx={tableRowSx} className={className} {...pointerProps} {...draggableProps}>
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
};

// ---------------------------------------------------------------------------------

/**
 * ?
 */
const TableBody = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewEntries = fileSystemViewDataStore((state) => state.entries);
  const filter = fileSystemViewStore((state) => state.filter);
  const loading = fileSystemLoadingStore((state) => state.loading);

  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => containerRef.current,
    count: viewEntries.length,
    estimateSize: () => tableRowHeight,
    overscan: 1,
  });

  const virtualItemListWrapperSx: SxProps = {
    position: "relative",
    height: `${rowVirtualizer.getTotalSize()}px`,
    width: 1,
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
    <TableBodyContainer ref={containerRef}>
      <Box sx={virtualItemListWrapperSx}>
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
    </TableBodyContainer>
  );
};

export { TableBody };
