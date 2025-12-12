import React from "react";
import { Box, ButtonBase } from "@mui/material";
import type { ButtonBaseProps, SxProps } from "@mui/material";

import type { TableFields, TableIconColumn, TableTextColumn } from "./fileSystemTableColumns";
import { tableColumns } from "./fileSystemTableColumns";
import { TableHeadCell, TableIconCell, TableTextCell, TableTextEditCell } from "./FileSystemTableCell";

import { fileSystemViewStore } from "../data/view";
import { useIsInClipboard } from "../data/clipboard";
import { endRenaming, setSorting } from "../data/action";

/**
 * 表格列的固定高度
 */
const tableRowHeight = 36;
export { tableRowHeight };

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
};

// ----------------------------------------------------------------------------

/**
 * 用於定位徽章元素的樣式
 */
const tableRowBadgeAnchorSx: SxProps = {
  position: "absolute",
  inset: "0 0 auto auto",
  display: "grid",
  placeItems: "center",
};

/**
 * 用於徽章本體的樣式
 */
const tableRowBadgeSx: SxProps = {
  position: "absolute",
  borderRadius: 1,
  bgcolor: "background.paper",
  p: 0.25,
  boxShadow: "0 2px 4px var(--vscode-widget-shadow)",
  border: "1px solid",
  borderColor: "tooltip.border",
  display: "grid",
  placeItems: "center",
};

/**
 * 用於呈現某 row 正在被複製或剪下的徽章
 */
const TableRowBadge = () => (
  <Box sx={{ ...tableRowBadgeAnchorSx, color: "text.secondary" }}>
    <Box sx={tableRowBadgeSx}>
      <i className="codicon codicon-copy" />
    </Box>
  </Box>
);

/**
 * 用於正在被複製或剪下的 row 的虛線邊框樣式
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
 * 用於給正在被複製或剪下的 row 提供視覺回饋
 */
const TableRowClipboardBorder = () => (
  <Box component="svg" preserveAspectRatio="none" width="100%" height="100%" sx={tableRowClipboardBorderSx}>
    <rect width="calc(100%)" height="calc(100%)" />
  </Box>
);

/**
 * 普通資料列組件的 props 型別
 */
type TableRowProps = ButtonBaseProps & {
  row: Record<TableFields, string> & { icon: `codicon codicon-${string}`; filePath: string };
  isDraggable: boolean;
  isRenaming: boolean;
};

/**
 * 用於呈現一個普通的資料列
 */
const TableRow = ({ sx, row, isDraggable, isRenaming, ...props }: TableRowProps) => {
  const isInClipboard = useIsInClipboard(row.filePath);

  const handleDragStart: React.DragEventHandler<HTMLButtonElement> = (e) => {
    const fileUrl = `file:///${row.filePath.replace(/\\/g, "/")}`;
    const filePath = row.filePath;
    const fileName = row.fileName;
    const mimeType = "application/octet-stream";
    const downloadURL = `${mimeType}:${fileName}:${fileUrl}`;

    e.dataTransfer.setData("DownloadURL", downloadURL);
    e.dataTransfer.setData("text/uri-list", fileUrl);
    e.dataTransfer.setData("application/vnd.code.uri-list", JSON.stringify([fileUrl]));
    e.dataTransfer.setData("codefiles", JSON.stringify([filePath]));
    e.dataTransfer.setData("resourceurls", JSON.stringify([fileUrl]));
    e.dataTransfer.effectAllowed = "copy";
  };

  const draggableProps: Partial<ButtonBaseProps> = isDraggable ? { draggable: true, onDragStart: handleDragStart } : {};

  return (
    <ButtonBase focusRipple={!isRenaming} sx={{ ...tableRowBaseSx, ...sx }} {...draggableProps} {...props}>
      {tableColumns.map((column) => {
        const { field } = column;
        const textVariant = field === "fileName" ? "primary" : "secondary";

        if (field === "icon") {
          return <TableIconCell key={field} icon={row.icon} iconColumn={column} />;
        }

        if (field !== "fileName" || !isRenaming) {
          return <TableTextCell key={field} variant={textVariant} text={row[field]} textColumn={column} />;
        }

        return (
          <TableTextEditCell
            key={field}
            text={row[field]}
            textColumn={column}
            onBlur={(newFileName) => endRenaming({ fileName: row.fileName, newFileName })}
          />
        );
      })}

      {isInClipboard && (
        <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <TableRowClipboardBorder />
          <TableRowBadge />
        </Box>
      )}
    </ButtonBase>
  );
};

// ----------------------------------------------------------------------------

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
