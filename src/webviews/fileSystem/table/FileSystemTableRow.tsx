import React from "react";
import { Box, ButtonBase } from "@mui/material";
import type { ButtonBaseProps, SxProps } from "@mui/material";

import type { TableFields, TableIconColumn, TableTextColumn } from "./fileSystemTableColumns";
import { tableColumns } from "./fileSystemTableColumns";
import { TableHeadCell, TableIconCell, TableTextCell } from "./FileSystemTableCell";
import { fileSystemViewStore, setSorting } from "../data/view";
import { useIsInClipboard } from "../data/clipboard";

/**
 * 表格列的固定高度
 */
const tableRowHeight = 36;

/**
 * 用於表格中每一列的基礎樣式
 */
const tableRowBaseSx: SxProps = {
  position: "relative",
  display: "flex",
  gap: 1,
  pr: 1,
  width: 1,
  alignItems: "stretch",
  justifyContent: "stretch",
  height: tableRowHeight,
  borderRadius: 1,
  overflow: "visible",

  "& svg rect": {
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

export { tableRowHeight };

// ----------------------------------------------------------------------------

type TableRowProps = ButtonBaseProps & {
  row: Record<TableFields, string> & { icon: `codicon codicon-${string}`; filePath: string };
};

/**
 * 用於呈現一個普通的資料列
 */
const TableRow = ({ sx, row, ...props }: TableRowProps) => {
  const isInClipboard = useIsInClipboard(row.filePath);

  return (
    <ButtonBase focusRipple sx={{ ...tableRowBaseSx, ...sx }} {...props}>
      {tableColumns.map((column) => {
        const { field } = column;
        const textVariant = field === "fileName" ? "primary" : "secondary";

        if (field === "icon") return <TableIconCell key={field} icon={row.icon} iconColumn={column} />;
        else return <TableTextCell key={field} variant={textVariant} text={row[field]} textColumn={column} />;
      })}

      {isInClipboard && (
        <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <svg preserveAspectRatio="none" width="100%" height="100%">
            <rect width="calc(100%)" height="calc(100%)" />
          </svg>

          {/* badge */}
          <Box
            sx={{
              position: "absolute",
              inset: "0 0 auto auto",
              display: "grid",
              placeItems: "center",
              color: isInClipboard === "copy" ? "text.secondary" : "text.primary",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                borderRadius: 1,
                bgcolor: "background.paper",
                p: 0.25,
                boxShadow: "0 2px 4px var(--vscode-widget-shadow)",
                border: "1px solid",
                borderColor: "tooltip.border",
                display: "grid",
                placeItems: "center",
              }}
            >
              {isInClipboard === "copy" ? (
                <i className="codicon codicon-copy" />
              ) : (
                <i className="codicon codicon-go-to-file" />
              )}
            </Box>
          </Box>
        </Box>
      )}
    </ButtonBase>
  );
};

/**
 * 用於當前目錄有上層目錄可供導航時，呈現的「返回上層目錄」列
 */
const TableNavigateUpRow = ({ sx, ...props }: ButtonBaseProps) => (
  <ButtonBase focusRipple sx={{ ...tableRowBaseSx, ...sx }} {...props}>
    <TableIconCell icon="codicon codicon-folder-opened" iconColumn={tableColumns[0] as TableIconColumn} />
    <TableTextCell text=".." variant="primary" textColumn={tableColumns[1] as TableTextColumn} />
  </ButtonBase>
);

/**
 * 用於呈現表格標題列，會自動從 store 取得目前的排序欄位與排序順序
 */
const TableHeadRow = () => {
  const sortField = fileSystemViewStore((state) => state.sortField);
  const sortOrder = fileSystemViewStore((state) => state.sortOrder);

  return (
    <Box sx={{ ...tableRowBaseSx, bgcolor: "background.paper" }}>
      {tableColumns.map((column) => {
        const { field } = column;

        if (field === "icon") {
          return <Box key={field} sx={{ width: column.width }} />;
        }

        return (
          <TableHeadCell
            key={field}
            column={column}
            active={field === sortField}
            sortOrder={sortOrder}
            onClick={() => field !== "fileType" && setSorting(field)}
          />
        );
      })}
    </Box>
  );
};

export { TableHeadRow, TableRow, TableNavigateUpRow };
