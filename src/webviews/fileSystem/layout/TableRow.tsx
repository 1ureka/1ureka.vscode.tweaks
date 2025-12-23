import { memo } from "react";
import { Box, ButtonBase, Typography, type SxProps } from "@mui/material";

import { formatFileSize, formatFileType, formatFixedLengthDateTime } from "@/utils/formatter";
import { extensionIconMap } from "@/assets/fileExtMap";
import type { InspectDirectoryEntry } from "@/utils/system";

import { tableColumns, tableIconFontSize, tableIconWidth, tableRowHeight } from "@@/fileSystem/layout/tableConfig";
import { clipboardStore, selectionStore, viewDataStore } from "@@/fileSystem/store/data";
import type { TableColumn } from "@@/fileSystem/layout/tableConfig";

/** 用於標示表格列的 class 名稱 */
const tableRowClassName = "table-row";
/** 用於標示表格中某列的單元格的 class 名稱 */
const tableRowCellClassName = "table-cell";

/** 表格列儲存在 html 中的指標屬性名稱 */
const tableRowIndexAttr = "data-index";

/**
 * 為項目指派對應的圖示
 */
const assignIcon = (entry: InspectDirectoryEntry) => {
  let icon: `codicon codicon-${string}` = `codicon codicon-${entry.fileType}`;

  if (entry.fileType !== "file") return icon;

  const fileName = entry.fileName.toLowerCase();
  const extension = fileName.includes(".") ? fileName.split(".").pop() || "" : "";

  if (extension in extensionIconMap) icon = extensionIconMap[extension];

  return icon;
};

// ---------------------------------------------------------------------------------

/**
 * 用於表格某 row 中的單元格
 */
const TableCell = ({ column, row }: { column: TableColumn; row: InspectDirectoryEntry }) => {
  const { fileName, fileType, ctime, mtime, size } = row;
  const { field, align, weight, width } = column;

  const variant = field === "fileName" ? "primary" : "secondary";
  const layoutStyle: React.CSSProperties = width ? { width } : { flex: weight };

  let text: string;
  if (field === "fileType") {
    text = formatFileType({ fileName, fileType });
  } else if (field === "ctime") {
    text = formatFixedLengthDateTime(new Date(ctime));
  } else if (field === "mtime") {
    text = formatFixedLengthDateTime(new Date(mtime));
  } else if (field === "size") {
    text = fileType === "file" ? formatFileSize(size) : "";
  } else {
    text = String(row[field]);
  }

  const className = `${tableRowCellClassName} align-${align} ${variant}`;

  return (
    <Typography className={className} style={layoutStyle} component="span" variant="caption">
      {text}
    </Typography>
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
 * 用於表格某一列中的單元格的樣式
 */
const tableRowCellSx: SxProps = {
  minWidth: 0,
  display: "block",

  "&.align-left": { textAlign: "left" },
  "&.align-center": { textAlign: "center" },
  "&.align-right": { textAlign: "right" },

  textOverflow: "ellipsis",
  overflow: "hidden",
  whiteSpace: "pre",
  lineHeight: `${tableRowHeight}px`,

  "&.primary": { color: "text.primary" },
  "&.secondary": { color: "text.secondary" },
};

/**
 * 用於表格列圖示的樣式
 */
const tableRowIconCellSx: SxProps = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: tableIconWidth,
  fontSize: tableIconFontSize,
};

/**
 * 用於表格中每一列的樣式，由 TableBody 來指派，增加效能
 */
const tableRowSx: SxProps = {
  position: "relative",
  width: 1,
  height: tableRowHeight,
  overflow: "visible",
  px: 0.5,

  display: "flex",
  alignItems: "stretch",
  justifyContent: "stretch",

  "&.selected": { bgcolor: "action.active" },
  [`& .${tableRowCellClassName}`]: tableRowCellSx,
  [`& .codicon[class*='codicon-']`]: tableRowIconCellSx,
};

/**
 * 用於呈現一個普通的資料列
 */
const TableRow = memo(({ index }: { index: number }) => {
  const viewEntries = viewDataStore((state) => state.entries);
  const row = viewEntries[index];

  const clipboardEntries = clipboardStore((state) => state.entries);
  const isInClipboard = row.filePath in clipboardEntries;

  let className = tableRowClassName;
  const selected = selectionStore((state) => state.selected);
  if (selected[index]) {
    className += " selected";
  }

  return (
    <ButtonBase className={className} draggable {...{ [tableRowIndexAttr]: index }}>
      <i className={assignIcon(row)} />

      {tableColumns.map((column) => (
        <TableCell key={column.field} column={column} row={row} />
      ))}

      {isInClipboard && <TableRowBorder />}
    </ButtonBase>
  );
});

export { tableRowSx, TableRow, tableRowClassName, tableRowIndexAttr };
