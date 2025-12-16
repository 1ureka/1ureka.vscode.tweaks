import { Fragment } from "react";
import { Box, type SxProps, Tooltip as MuiTooltip, Typography } from "@mui/material";

type TooltipProps = {
  children: React.ReactElement;
  actionName: string;
  actionDetail?: string;
  actionShortcut?: string[];
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

const tooltipKBDSx: SxProps = {
  borderRadius: 1,
  border: "1px solid",
  borderColor: "tooltip.border",
  boxShadow: "0 1px 4px var(--vscode-widget-shadow)",
  px: 0.5,
};

const TooltipShortcutDisplay = ({ actionShortcut }: { actionShortcut: string[] }) => (
  <Box sx={{ display: "flex", gap: 0.25, flexWrap: "wrap", alignItems: "center" }}>
    {actionShortcut.map((key, index) => (
      <Fragment key={key}>
        <Box sx={tooltipKBDSx}>
          <Typography variant="caption" sx={{ fontFamily: "var(--vscode-editor-font-family)" }}>
            {key}
          </Typography>
        </Box>
        {index < actionShortcut.length - 1 && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            +
          </Typography>
        )}
      </Fragment>
    ))}
  </Box>
);

const Tooltip = ({ children, actionName, actionDetail, actionShortcut }: TooltipProps) => (
  <MuiTooltip
    slotProps={{ popper: { sx: { [tooltipContainerSelector]: tooltipContainerSx } } }}
    title={
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Box sx={{ width: 1, display: "flex", flexDirection: "column" }}>
          <Typography variant="caption">{actionName}</Typography>

          {actionDetail && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {actionDetail}
            </Typography>
          )}
        </Box>

        {actionShortcut && <TooltipShortcutDisplay actionShortcut={actionShortcut} />}
      </Box>
    }
  >
    {children}
  </MuiTooltip>
);

export { Tooltip };
