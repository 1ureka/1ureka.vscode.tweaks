import React from "react";
import { fileSystemDataStore } from "../data/data";
import { fileSystemViewDataStore } from "../data/view";
import { refresh } from "../data/navigate";
import { colorMix } from "@/utils/ui";
import { Box, ButtonBase, Divider, Typography } from "@mui/material";
import type { ButtonBaseProps, SxProps } from "@mui/material";
import { FooterTooltip } from "./FileSystemFooterTooltip";

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
          <FooterTooltip actionName="重新整理" actionShortcut={["Ctrl", "R"]}>
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

          <FooterTooltip actionName="全選" actionShortcut={["Ctrl", "A"]}>
            <FooterButton disabled={allSelected}>
              <i className="codicon codicon-checklist" />
            </FooterButton>
          </FooterTooltip>

          <FooterTooltip actionName="取消全選" actionShortcut={["Ctrl", "Shift", "A"]}>
            <FooterButton disabled={selectedCount === 0}>
              <i className="codicon codicon-clear-all" />
            </FooterButton>
          </FooterTooltip>

          <FooterTooltip actionName="反轉選取" actionShortcut={["Ctrl", "I"]}>
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

          <FooterTooltip actionName="複製選取項目到剪貼簿" actionShortcut={["Ctrl", "C"]}>
            <FooterButton disabled={selectedCount === 0}>
              <i className="codicon codicon-git-stash-apply" />
            </FooterButton>
          </FooterTooltip>

          <FooterTooltip actionName="剪下選取項目到剪貼簿" actionShortcut={["Ctrl", "X"]}>
            <FooterButton disabled={selectedCount === 0}>
              <i className="codicon codicon-git-stash-pop" />
            </FooterButton>
          </FooterTooltip>

          <FooterTooltip actionName="貼上剪貼簿中的項目" actionShortcut={["Ctrl", "V"]}>
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
