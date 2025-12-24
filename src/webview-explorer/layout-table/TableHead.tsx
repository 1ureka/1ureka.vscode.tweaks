import { memo } from "react";
import { Box, SxProps, Typography } from "@mui/material";
import { ellipsisSx } from "@/utils/ui";

import { viewDataStore, viewStateStore } from "@explorer/store/data";
import { setSorting } from "@explorer/action/view";
import { tableColumns, tableHeadHeight, tableIconWidth } from "@explorer/layout-table/config";
import type { TableColumn } from "@explorer/layout-table/config";

/**
 * 用於表格標題列的單元格樣式變體
 */
type TableHeadCellVariant = "active" | "default" | "disabled";

/**
 * 用於表格標題列的單元格樣式
 */
const tableCellSx: SxProps = {
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  overflow: "hidden",

  "&.align-left": {
    justifyContent: "flex-start",
    flexDirection: "row",
  },
  "&.align-center": {
    justifyContent: "center",
    flexDirection: "row",
  },
  "&.align-right": {
    justifyContent: "flex-start",
    flexDirection: "row-reverse",
  },

  "&.active": {
    cursor: "pointer",
    userSelect: "none",
    "&:hover > span.codicon": { color: "text.primary" },
    "& > span.codicon": { color: "text.secondary" },
  },
  "&.default": {
    cursor: "pointer",
    userSelect: "none",
    "&:hover > span.codicon": { color: "text.secondary" },
    "& > span.codicon": { color: "transparent" },
  },
  "&.disabled": {
    cursor: "default",
    userSelect: "auto",
  },
};

/**
 * 用於表格標題列的單元格內的標籤樣式
 */
const tableCellLableSx: SxProps = {
  ...ellipsisSx,

  "&.active": { color: "text.primary" },
  "&.default": { color: "text.primary" },
  "&.disabled": { color: "text.secondary" },
};

/**
 * 用於表格標題列的單元格
 */
const TableHeadCell = ({ column }: { column: TableColumn }) => {
  const { field, label, align, weight, width, sortable } = column;
  const sortField = viewStateStore((state) => state.sortField);
  const sortOrder = viewStateStore((state) => state.sortOrder);

  const layoutStyle: React.CSSProperties = width ? { width } : { flex: weight };
  const handleClick = field !== "fileType" ? () => setSorting(field) : undefined;

  let state: TableHeadCellVariant;
  if (!sortable) {
    state = "disabled";
  } else {
    state = sortField === field ? "active" : "default";
  }

  return (
    <Box className={`${state} align-${align}`} sx={tableCellSx} style={layoutStyle} onClick={handleClick}>
      <Typography className={state} variant="caption" sx={tableCellLableSx}>
        {label}
      </Typography>
      {state !== "disabled" && <span className={`codicon codicon-arrow-${sortOrder === "asc" ? "up" : "down"}`} />}
    </Box>
  );
};

/**
 * 表格標題列的樣式
 */
const tableHeadSx: SxProps = {
  display: "flex",
  alignItems: "stretch",
  width: 1,
  height: tableHeadHeight,
  borderRadius: 1,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  bgcolor: "background.paper",
  px: 0.5,

  // 讓 head 與 row/body 對齊，避免右側與 row/body 右側是不對齊的情況
  overflowY: "auto",
  scrollbarGutter: "stable",
};

/**
 * 用於系統瀏覽器的表格標題列元件
 */
const TableHead = memo(() => {
  const viewMode = viewDataStore((state) => state.viewMode);
  if (viewMode !== "directory") {
    return null;
  }

  return (
    <Box sx={tableHeadSx}>
      <Box sx={{ width: tableIconWidth }} />
      {tableColumns.map((column) => (
        <TableHeadCell key={column.field} column={column} />
      ))}
    </Box>
  );
});

export { TableHead };
