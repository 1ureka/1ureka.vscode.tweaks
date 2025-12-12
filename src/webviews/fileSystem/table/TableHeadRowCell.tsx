import React from "react";
import { Box, Typography } from "@mui/material";
import { ellipsisSx } from "@/utils/ui";
import type { SxProps, BoxProps } from "@mui/material";
import type { TableColumn } from "./common";

/**
 * 表格標題列單元格的 props 型別
 */
type TableHeadCellProps = { column: TableColumn; sortOrder: "asc" | "desc"; active: boolean } & Omit<
  BoxProps,
  "children"
>;

/**
 * 用於表格標題列的單元格樣式變體
 */
type TableHeadCellVariant = "active" | "default" | "disabled";

/**
 * 表格標題列單元格樣式對應表
 */
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

  const textVariant = variant === "disabled" ? "secondary" : "primary";
  const colorSx: SxProps = { color: `text.${textVariant}` };

  return (
    <Box sx={{ flex: weight, display: "grid", alignItems: "center", justifyContent: align, ...cellSx }} {...rest}>
      {variant !== "disabled" && align === "right" && (
        <span className={`codicon codicon-arrow-${sortOrder === "asc" ? "up" : "down"}`} />
      )}
      <Typography variant="body2" sx={{ ...colorSx, ...ellipsisSx }}>
        {label}
      </Typography>
      {variant !== "disabled" && align !== "right" && (
        <span className={`codicon codicon-arrow-${sortOrder === "asc" ? "up" : "down"}`} />
      )}
    </Box>
  );
};

export { TableHeadCell };
