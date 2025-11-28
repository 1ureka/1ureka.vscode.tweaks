import React from "react";
import { Box, ButtonBase, Typography, type SxProps } from "@mui/material";

/**
 * 操作列標頭樣式
 */
const operationBarHeaderSx: SxProps = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: 1,
  bgcolor: "background.paper",
  px: 1,
};

/**
 * 操作列標頭元件
 */
const OperationBarHeader = () => (
  <Box sx={{ position: "relative" }}>
    {/* 只是為了拿到高度 */}
    <Box sx={{ p: 1, opacity: 0 }}>
      <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
        操作區
      </Typography>
    </Box>

    <Box sx={operationBarHeaderSx}>
      <Box sx={{ color: "text.secondary" }}>
        <i className="codicon codicon-menu" style={{ color: "inherit", display: "block" }} />
      </Box>

      <ButtonBase focusRipple sx={{ borderRadius: 1, p: 0.5, "&:hover": { bgcolor: "table.hoverBackground" } }}>
        <i className="codicon codicon-layout-sidebar-left-dock" />
      </ButtonBase>
    </Box>
  </Box>
);

export { OperationBarHeader };
