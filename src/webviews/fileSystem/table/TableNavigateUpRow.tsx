import React from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import type { SxProps } from "@mui/material";

import { TableIconCell } from "./TableRowCell";
import { tableRowBaseSx } from "./common";
import { navigateUp } from "../data/navigate";
import { fileSystemDataStore } from "../data/data";
import { ellipsisSx } from "@/utils/ui";

/**
 * 用於呈現「返回上層目錄」列的樣式
 */
const tableNavigateUpRowSx: SxProps = {
  ...tableRowBaseSx,
  borderRadius: 1,
  pointerEvents: "auto",
  bgcolor: "table.alternateRowBackground",
  "&:hover": { bgcolor: "table.hoverBackground" },
};

/**
 * 用於當前目錄有上層目錄可供導航時，呈現的「返回上層目錄」列
 */
const TableNavigateUpRow = () => {
  const isCurrentRoot = fileSystemDataStore((state) => state.isCurrentRoot);

  if (isCurrentRoot) {
    return null;
  }

  return (
    <ButtonBase focusRipple sx={tableNavigateUpRowSx} onClick={navigateUp}>
      <TableIconCell icon="codicon codicon-folder-opened" />
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
        <Typography variant="body2" sx={{ color: "text.primary", ...ellipsisSx }}>
          ..
        </Typography>
      </Box>
    </ButtonBase>
  );
};

export { TableNavigateUpRow };
