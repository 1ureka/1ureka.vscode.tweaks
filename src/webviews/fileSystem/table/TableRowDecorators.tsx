import React from "react";
import { Box, type SxProps } from "@mui/material";
import { useIsInClipboard } from "../data/clipboard";

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
 * 用於呈現某 row 正處於剪貼簿中的徽章
 */
const TableRowBadge = () => (
  <Box sx={{ ...tableRowBadgeAnchorSx, color: "text.secondary" }}>
    <Box sx={tableRowBadgeSx}>
      <i className="codicon codicon-copy" />
    </Box>
  </Box>
);

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
  <Box component="svg" preserveAspectRatio="none" width="100%" height="100%" sx={tableRowClipboardBorderSx}>
    <rect width="calc(100%)" height="calc(100%)" />
  </Box>
);

/**
 * 用於給正存在剪貼簿中的 row 提供視覺回饋
 */
const TableRowClipboardDecorator = ({ filePath }: { filePath: string }) => {
  const isInClipboard = useIsInClipboard(filePath);

  if (!isInClipboard) {
    return null;
  }

  return (
    <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <TableRowBorder />
      <TableRowBadge />
    </Box>
  );
};

export { TableRowClipboardDecorator };
