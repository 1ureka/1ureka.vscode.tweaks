import React from "react";
import { fileSystemDataStore } from "../data/data";
import { fileSystemViewDataStore } from "../data/view";
import { refresh } from "../data/navigate";
import { colorMix } from "@/utils/ui";
import { Box, ButtonBase, Divider, Tooltip, Typography } from "@mui/material";
import type { ButtonBaseProps, SxProps, TooltipProps } from "@mui/material";

const FooterButton = ({ children, sx, disabled, ...props }: ButtonBaseProps) => {
  const defaultSx: SxProps = {
    p: 0.8,
    "&:hover": { bgcolor: "table.hoverBackground" },
    color: disabled ? "text.disabled" : "inherit",
  };
  return (
    <ButtonBase focusRipple disabled={disabled} sx={{ ...defaultSx, ...sx }} {...props}>
      {children}
    </ButtonBase>
  );
};

const FooterTooltip = ({ children, ...props }: TooltipProps) => {
  return (
    <Tooltip
      slotProps={{
        popper: {
          sx: {
            '&.MuiTooltip-popper[data-popper-placement*="top"] .MuiTooltip-tooltip': {
              bgcolor: "tooltip.background",
              border: "1px solid",
              borderColor: "tooltip.border",
              boxShadow: "0 2px 8px var(--vscode-widget-shadow)",
              borderRadius: 1,
              m: 1,
            },
          },
        },
      }}
      {...props}
    >
      {children}
    </Tooltip>
  );
};

const footerFlexBoxSx: SxProps = {
  display: "flex",
  alignItems: "stretch",
  gap: 1,
  rowGap: 0,
  flexWrap: "wrap",
};

const FileSystemFooter = () => {
  const timestamp = fileSystemDataStore((state) => state.timestamp);
  const handleRefresh = () => refresh();

  const selected = fileSystemViewDataStore((state) => state.selected);
  const selectedCount = selected.filter((item) => item).length;
  const allSelected = selectedCount === selected.length && selected.length > 0;
  const selectionCaption = selectedCount > 0 ? `選取了 ${selectedCount} 個項目` : "未選取任何項目";

  return (
    <Box
      sx={{
        ...footerFlexBoxSx,
        justifyContent: "space-between",
        px: 2,
        bgcolor: colorMix("background-paper", "background-default", 80),
        borderBottom: "2px solid var(--vscode-editorGroup-border)",
      }}
    >
      <Box sx={footerFlexBoxSx}>
        <Box sx={{ ...footerFlexBoxSx, gap: 0, flexWrap: "nowrap" }}>
          <FooterTooltip title="重新整理">
            <FooterButton onClick={handleRefresh}>
              <i className="codicon codicon-sync" />
            </FooterButton>
          </FooterTooltip>

          <Typography variant="caption" sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
            {new Date(timestamp).toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>

      <Box sx={footerFlexBoxSx}>
        <Box sx={{ ...footerFlexBoxSx, gap: 0, flexWrap: "nowrap" }}>
          <Typography variant="caption" sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
            {selectionCaption}
          </Typography>

          <FooterTooltip title="全選">
            <FooterButton disabled={allSelected}>
              <i className="codicon codicon-checklist" />
            </FooterButton>
          </FooterTooltip>

          <FooterTooltip title="取消全選">
            <FooterButton disabled={selectedCount === 0}>
              <i className="codicon codicon-clear-all" />
            </FooterButton>
          </FooterTooltip>

          <FooterTooltip title="反轉選取">
            <FooterButton>
              <i className="codicon codicon-arrow-swap" />
            </FooterButton>
          </FooterTooltip>
        </Box>

        <Divider orientation="vertical" flexItem />

        <Box sx={{ ...footerFlexBoxSx, gap: 0, flexWrap: "nowrap" }}>
          <Typography variant="caption" sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
            剪貼簿有 0 個項目
          </Typography>

          <FooterTooltip title="複製選取項目到剪貼簿">
            <FooterButton disabled={selectedCount === 0}>
              <i className="codicon codicon-git-stash-apply" />
            </FooterButton>
          </FooterTooltip>

          <FooterTooltip title="剪下選取項目到剪貼簿">
            <FooterButton disabled={selectedCount === 0}>
              <i className="codicon codicon-git-stash-pop" />
            </FooterButton>
          </FooterTooltip>

          <FooterTooltip title="貼上剪貼簿中的項目">
            <FooterButton>
              <i className="codicon codicon-git-stash" />
            </FooterButton>
          </FooterTooltip>
        </Box>
      </Box>
    </Box>
  );
};

export { FileSystemFooter };
