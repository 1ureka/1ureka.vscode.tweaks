import React from "react";
import { Box, type SxProps, Tooltip, Typography } from "@mui/material";

type TooltipProps = {
  children: React.ReactElement;
  actionName: string;
  actionShortcut: string[];
};

const tooltipContainerSx: SxProps = {
  bgcolor: "tooltip.background",
  border: "1px solid",
  borderColor: "tooltip.border",
  boxShadow: "0 2px 8px var(--vscode-widget-shadow)",
  borderRadius: 1,
  m: 1,
};

const tooltipContainerSelectors = [
  '&.MuiTooltip-popper[data-popper-placement*="top"] .MuiTooltip-tooltip',
  '&.MuiTooltip-popper[data-popper-placement*="bottom"] .MuiTooltip-tooltip',
  '&.MuiTooltip-popper[data-popper-placement*="left"] .MuiTooltip-tooltip',
  '&.MuiTooltip-popper[data-popper-placement*="right"] .MuiTooltip-tooltip',
];

const tooltipContainerSelector = tooltipContainerSelectors.join(", ");

const FooterTooltip = ({ children, actionName, actionShortcut }: TooltipProps) => (
  <Tooltip
    slotProps={{ popper: { sx: { [tooltipContainerSelector]: tooltipContainerSx } } }}
    title={
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography variant="caption">{actionName}</Typography>

        <Box sx={{ display: "flex", gap: 0.25, flexWrap: "wrap", alignItems: "center" }}>
          {actionShortcut.map((key, index) => (
            <React.Fragment key={key}>
              <Box
                sx={{
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "tooltip.border",
                  boxShadow: "0 1px 4px var(--vscode-widget-shadow)",
                  px: 0.5,
                }}
              >
                <Typography variant="caption" sx={{ fontFamily: "var(--vscode-editor-font-family)" }}>
                  {key}
                </Typography>
              </Box>
              {index < actionShortcut.length - 1 && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  +
                </Typography>
              )}
            </React.Fragment>
          ))}
        </Box>
      </Box>
    }
  >
    {children}
  </Tooltip>
);

export { FooterTooltip };
