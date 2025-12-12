import React from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import type { ButtonBaseProps, SxProps } from "@mui/material";

import { tableColumns, tableRowBaseSx } from "./common";
import { TableIconCell } from "./TableRowCell";
import { ellipsisSx } from "@/utils/ui";

/**
 * 用於當前目錄有上層目錄可供導航時，呈現的「返回上層目錄」列
 */
const TableNavigateUpRow = ({ sx, ...props }: ButtonBaseProps) => {
  const mergedSx: SxProps = { ...tableRowBaseSx, ...sx } as SxProps;

  return (
    <ButtonBase focusRipple sx={mergedSx} {...props}>
      {tableColumns.map((column) => {
        const { field } = column;

        if (field === "icon") {
          return <TableIconCell key={field} icon="codicon codicon-folder-opened" />;
        }

        const { weight: flex } = column;

        if (field === "fileName") {
          return (
            <Box sx={{ flex, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
              <Typography variant="body2" sx={{ color: "text.primary", ...ellipsisSx }}>
                ..
              </Typography>
            </Box>
          );
        }
      })}
    </ButtonBase>
  );
};

export { TableNavigateUpRow };
