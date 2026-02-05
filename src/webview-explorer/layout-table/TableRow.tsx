import { memo } from "react";
import { ButtonBase, Typography } from "@mui/material";

import { formatFileSize, formatFileType, formatFixedLengthDateTime } from "@/utils/shared/formatter";
import { extensionIconMap } from "@/assets/fileExtMap";
import type { FileMetadata } from "@/feature-explorer/types";

import type { TableColumn } from "@explorer/layout-table/config";
import { tableColumns, tableClass } from "@explorer/layout-table/config";
import { clipboardStore, selectionStore, viewDataStore, viewStateStore } from "@explorer/store/data";
import { loadingStore } from "@explorer/store/queue";

/**
 * 表格列儲存在 html 中的指標屬性名稱
 */
const tableRowIndexAttr = "data-index";

/**
 * 為項目指派對應的圖示
 */
const assignIcon = (entry: FileMetadata) => {
  let icon: `codicon codicon-${string}` = `codicon codicon-${entry.fileType}`;

  if (entry.fileType !== "file") return icon;

  const fileName = entry.fileName.toLowerCase();
  const extension = fileName.includes(".") ? fileName.split(".").pop() || "" : "";

  return extensionIconMap[extension] ?? icon;
};

// ---------------------------------------------------------------------------------

/**
 * 用於表格某 row 中的單元格
 */
const TableCell = ({ column, row }: { column: TableColumn; row: FileMetadata }) => {
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

  const className = `${tableClass.rowCell} align-${align} ${variant}`;

  return (
    <Typography className={className} style={layoutStyle} component="span" variant="caption">
      {text}
    </Typography>
  );
};

/**
 * 用於呈現一個普通的資料列
 */
const TableRow = memo(({ index }: { index: number }) => {
  const viewEntries = viewDataStore((state) => state.entries);
  const row = viewEntries[index];

  const clipboardEntries = clipboardStore((state) => state.entries);
  const selected = selectionStore((state) => state.selected);

  let className = tableClass.row;
  if (selected[index]) className += " selected";

  return (
    <ButtonBase className={className} draggable {...{ [tableRowIndexAttr]: index }}>
      <i className={assignIcon(row)} />

      {tableColumns.map((column) => (
        <TableCell key={column.field} column={column} row={row} />
      ))}

      {row.filePath in clipboardEntries && <div className={tableClass.rowClipboardOverlay} />}
    </ButtonBase>
  );
});

/**
 * 資料列的特殊變體，用於在沒有任何項目時顯示訊息
 */
const TableRowNoItem = memo(() => {
  const loading = loadingStore((state) => state.loading);
  const filter = viewStateStore((state) => state.filter);

  let noItemMessage = "此資料夾是空的";

  if (loading) {
    noItemMessage = "載入中...";
  } else if (filter) {
    noItemMessage = "沒有符合篩選條件的項目";
  }

  return (
    <Typography className={`${tableClass.rowCell} align-center secondary`} component="span" variant="caption">
      {noItemMessage}
    </Typography>
  );
});

export { TableRow, TableRowNoItem, tableRowIndexAttr };
