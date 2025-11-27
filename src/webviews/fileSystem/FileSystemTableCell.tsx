import React from "react";
import { Box, type BoxProps, type SxProps, Typography } from "@mui/material";
import { ellipsisSx } from "../utils/Providers";

type FileSystemListCellProps = {
  align?: "left" | "center" | "right";
} & BoxProps;

/**
 * 只有基本樣式的單一儲存格組件，一般用於 row
 */
const FileSystemListCell = ({ children, align = "right", sx, ...rest }: FileSystemListCellProps) => (
  <Box sx={{ px: 2, py: 1, display: "grid", alignItems: "center", justifyContent: align, ...sx }} {...rest}>
    {children}
  </Box>
);

type FileSystemListCellTextProps = {
  text: string;
  variant?: "primary" | "secondary";
};

/**
 * 儲存格組件中的文字組件
 */
const FileSystemListCellText = ({ text, variant = "secondary" }: FileSystemListCellTextProps) => {
  const colorSx: SxProps = variant === "primary" ? { color: "text.primary" } : { color: "text.secondary" };
  return (
    <Typography variant="body2" sx={{ ...colorSx, ...ellipsisSx }}>
      {text}
    </Typography>
  );
};

type FileSystemListHeaderCellProps = {
  title: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  sortOrder?: "asc" | "desc";
  active?: boolean;
} & Omit<BoxProps, "children" | "title">;

/**
 * 表頭專用的儲存格組件，包含排序圖示等功能
 */
const FileSystemListHeaderCell = ({ title, align = "right", sx, ...rest }: FileSystemListHeaderCellProps) => {
  const { sortable, active, sortOrder } = rest;
  const variant = sortable ? (active ? "active" : "default") : "disabled";

  const cellSxMap: Record<typeof variant, SxProps> = {
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

  const cellSx = {
    pointerEvents: "auto",
    gridAutoFlow: "column",
    gap: 0.5,
    ...cellSxMap[variant],
    ...sx,
  } as SxProps;

  return (
    <FileSystemListCell sx={cellSx} align={align} {...rest}>
      {variant !== "disabled" && align === "right" && (
        <span className={`codicon codicon-arrow-${sortOrder === "asc" ? "up" : "down"}`} />
      )}

      <FileSystemListCellText text={title} variant={variant === "disabled" ? "secondary" : "primary"} />

      {variant !== "disabled" && align !== "right" && (
        <span className={`codicon codicon-arrow-${sortOrder === "asc" ? "up" : "down"}`} />
      )}
    </FileSystemListCell>
  );
};

export { FileSystemListCell, FileSystemListCellText, FileSystemListHeaderCell };
