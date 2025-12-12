import React from "react";
import { Typography, Box, TextField } from "@mui/material";
import type { SxProps, BoxProps } from "@mui/material";

import { ellipsisSx } from "@/utils/ui";
import type { TableIconColumn, TableTextColumn } from "./fileSystemTableColumns";

// ----------------------------------------------------------------------------

type TableCellTextProps = { text: string; variant?: "primary" | "secondary" };

/**
 * 用於表格單元格中的文字顯示
 */
const TableCellText = ({ text, variant = "secondary" }: TableCellTextProps) => {
  const colorSx: SxProps = variant === "primary" ? { color: "text.primary" } : { color: "text.secondary" };
  return (
    <Typography variant="body2" sx={{ ...colorSx, ...ellipsisSx }}>
      {text}
    </Typography>
  );
};

type TableCellIconProps = { icon: `codicon codicon-${string}` };

/**
 * 用於表格單元格中的圖示顯示
 */
const TableCellIcon = ({ icon }: TableCellIconProps) => {
  return <i className={icon} style={{ display: "flex", alignItems: "center" }} />;
};

type TableCellTextEditProps = { text: string; onBlur: (newText: string) => void };

/**
 * 用於表格單元格中的可編輯文字顯示
 */
const TableCellTextEdit = ({ text, onBlur }: TableCellTextEditProps) => {
  return (
    <TextField
      variant="standard"
      defaultValue={text}
      autoFocus
      onBlur={(e) => onBlur(e.target.value)}
      sx={{ width: 1 }}
    />
  );
};

// ----------------------------------------------------------------------------

type TableIconCellProps = TableCellIconProps & { iconColumn: TableIconColumn };

/**
 * 用於表格某 row 中的圖示單元格
 */
const TableIconCell = ({ icon, iconColumn }: TableIconCellProps) => {
  const { align, width } = iconColumn;
  const justifyContent = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";
  return (
    <Box sx={{ width, display: "flex", alignItems: "center", justifyContent }}>
      <TableCellIcon icon={icon} />
    </Box>
  );
};

type TableTextCellProps = TableCellTextProps & { textColumn: TableTextColumn };

/**
 * 用於表格某 row 中的文字單元格
 */
const TableTextCell = ({ text, variant, textColumn }: TableTextCellProps) => {
  const { align, weight: flex } = textColumn;
  const justifyContent = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";
  return (
    <Box sx={{ flex, minWidth: 0, display: "flex", alignItems: "center", justifyContent }}>
      <TableCellText text={text} variant={variant} />
    </Box>
  );
};

type TableTextEditCellProps = TableCellTextEditProps & { textColumn: TableTextColumn };

/**
 * 用於表格某 row 中的可編輯文字單元格
 */
const TableTextEditCell = ({ text, onBlur, textColumn }: TableTextEditCellProps) => {
  const { align, weight: flex } = textColumn;
  const justifyContent = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";
  return (
    <Box sx={{ flex, minWidth: 0, display: "flex", alignItems: "center", justifyContent }}>
      <TableCellTextEdit text={text} onBlur={onBlur} />
    </Box>
  );
};

// ----------------------------------------------------------------------------

type TableHeadCellProps = {
  column: TableTextColumn;
  sortOrder: "asc" | "desc";
  active: boolean;
} & Omit<BoxProps, "children">;

type TableHeadCellVariant = "active" | "default" | "disabled";

const tableCellSxMap: Record<TableHeadCellVariant, SxProps> = {
  active: {
    cursor: "pointer",
    userSelect: "none",
    "&:hover > span.codicon": { color: "text.primary" },
    "& > span.codicon": { color: "text.secondary" },
  },
  default: {
    cursor: "pointer",
    userSelect: "none",
    "&:hover > span.codicon": { color: "text.secondary" },
    "& > span.codicon": { color: "transparent" },
  },
  disabled: {
    cursor: "default",
    userSelect: "auto",
  },
};

/**
 * 用於表格標題列的單元格
 */
const TableHeadCell = ({ column, sx, ...rest }: TableHeadCellProps) => {
  const { label, align, weight, sortable } = column;
  const { active, sortOrder } = rest;

  const variant = sortable ? (active ? "active" : "default") : "disabled";
  const cellSx = { gridAutoFlow: "column", gap: 0.5, ...tableCellSxMap[variant], ...sx } as SxProps;

  return (
    <Box sx={{ flex: weight, display: "grid", alignItems: "center", justifyContent: align, ...cellSx }} {...rest}>
      {variant !== "disabled" && align === "right" && (
        <span className={`codicon codicon-arrow-${sortOrder === "asc" ? "up" : "down"}`} />
      )}
      <TableCellText text={label} variant={variant === "disabled" ? "secondary" : "primary"} />
      {variant !== "disabled" && align !== "right" && (
        <span className={`codicon codicon-arrow-${sortOrder === "asc" ? "up" : "down"}`} />
      )}
    </Box>
  );
};

export { TableIconCell, TableTextCell, TableTextEditCell, TableHeadCell };
