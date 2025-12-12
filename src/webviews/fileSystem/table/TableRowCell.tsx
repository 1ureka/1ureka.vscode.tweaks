import React from "react";
import { Typography, Box, TextField } from "@mui/material";
import { ellipsisSx } from "@/utils/ui";
import { tableIconWidth } from "./common";
import type { SxProps } from "@mui/material";
import type { TableColumn } from "./common";

/**
 * 用於表格某 row 中的圖示單元格
 */
const TableIconCell = ({ icon }: { icon: `codicon codicon-${string}` }) => (
  <Box sx={{ width: tableIconWidth, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <i className={icon} style={{ display: "flex", alignItems: "center" }} />
  </Box>
);

/**
 * 用於表格某 row 中的普通單元格
 */
const TableCell = (props: { text: string; variant: "primary" | "secondary"; column: TableColumn }) => {
  const { text, variant } = props;
  const { align, weight: flex } = props.column;

  const justifyContent = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";
  const colorSx: SxProps = { color: `text.${variant}` };

  return (
    <Box sx={{ flex, minWidth: 0, display: "flex", alignItems: "center", justifyContent }}>
      <Typography variant="body2" sx={{ ...colorSx, ...ellipsisSx }}>
        {text}
      </Typography>
    </Box>
  );
};

/**
 * 用於表格某 row 中的正在編輯單元格
 */
const TableEditingCell = (props: { text: string; onBlur: (newText: string) => void; column: TableColumn }) => {
  const { text, onBlur } = props;
  const { align, weight: flex } = props.column;

  const justifyContent = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";

  return (
    <Box sx={{ flex, minWidth: 0, display: "flex", alignItems: "center", justifyContent }}>
      <TextField
        size="small"
        variant="standard"
        defaultValue={text}
        autoFocus
        onBlur={(e) => onBlur(e.target.value)}
        sx={{ width: 1 }}
      />
    </Box>
  );
};

export { TableIconCell, TableCell, TableEditingCell };
