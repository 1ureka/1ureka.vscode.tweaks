import { memo } from "react";
import { Box, ButtonBase, Typography, type SxProps } from "@mui/material";

import { formatFileSize, formatFileType, formatFixedLengthDateTime } from "@/utils/formatter";
import { ellipsisSx } from "@/utils/ui";
import { extensionIconMap } from "@/assets/fileExtMap";
import type { InspectDirectoryEntry } from "@/utils/system";

import { tableColumns, tableIconFontSize, tableIconWidth, tableRowHeight } from "@@/fileSystem/layout/tableConfig";
import { clipboardStore, selectionStore, viewDataStore } from "@@/fileSystem/store/data";
import type { TableColumn } from "@@/fileSystem/layout/tableConfig";

/**
 * 用於標示表格列的 class 名稱
 */
const tableRowClassName = "table-row";

/**
 * 表格列儲存在 html 中的指標屬性名稱
 */
const tableRowIndexAttr = "data-index";

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

  if (entry.fileType !== "file") return icon;

  const fileName = entry.fileName.toLowerCase();
  const extension = fileName.includes(".") ? fileName.split(".").pop() || "" : "";

  if (extension in extensionIconMap) icon = extensionIconMap[extension];

  return icon;
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
  const indexDataProp = { [tableRowIndexAttr]: index };
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
    <ButtonBase sx={tableRowSx} className={className} {...indexDataProp} draggable>
      <Box sx={{ width: tableIconWidth, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <i className={assignIcon(row)} style={{ display: "flex", alignItems: "center", fontSize: tableIconFontSize }} />
      </Box>

      {tableColumns.map((column) => (
        <TableCell key={column.field} column={column} row={row} />
      ))}

      {isInClipboard && <TableRowBorder />}
    </ButtonBase>
  );
});

export { TableRow, tableRowClassName, tableRowIndexAttr };
