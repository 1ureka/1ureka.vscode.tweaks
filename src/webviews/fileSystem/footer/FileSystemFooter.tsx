import React from "react";
import { Divider, Typography } from "@mui/material";
import { FooterTooltip } from "./FileSystemFooterTooltip";
import { FooterButton, FooterContainer, FooterGroup, FooterGroups } from "./FileSystemGroup";

import { fileSystemDataStore } from "../data/data";
import { fileSystemViewDataStore } from "../data/view";
import { selectAll, selectInvert, selectNone } from "../data/selection";
import { useIsBoxSelecting, toggleBoxSelectionMode } from "../data/selection";
import { setClipboard, useClipboardCount } from "../data/clipboard";
import { refresh } from "../data/navigate";

const FileSystemFooter = () => {
  const timestamp = fileSystemDataStore((state) => state.timestamp);
  const handleRefresh = () => refresh();

  const selected = fileSystemViewDataStore((state) => state.selected);
  const selectedCount = selected.filter((item) => item).length;
  const allSelected = selectedCount === selected.length && selected.length > 0;
  const selectionCaption = selectedCount > 0 ? `選取了 ${selectedCount} 個項目` : "未選取任何項目";

  const clipboardCount = useClipboardCount();
  const clipboardCaption = clipboardCount > 0 ? `剪貼簿有 ${clipboardCount} 個項目` : "剪貼簿是空的";

  const isBoxSelecting = useIsBoxSelecting();

  return (
    <FooterContainer>
      <FooterGroups>
        <FooterGroup>
          <FooterTooltip actionName="重新整理" actionShortcut={["Ctrl", "R"]}>
            <FooterButton onClick={handleRefresh}>
              <i className="codicon codicon-sync" />
            </FooterButton>
          </FooterTooltip>

          <Typography variant="caption" sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
            {new Date(timestamp).toLocaleTimeString()}
          </Typography>
        </FooterGroup>
      </FooterGroups>

      <FooterGroups>
        <FooterGroup>
          <Typography variant="caption" sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
            {selectionCaption}
          </Typography>

          <FooterTooltip actionName="全選" actionShortcut={["Ctrl", "A"]}>
            <FooterButton disabled={allSelected} onClick={selectAll}>
              <i className="codicon codicon-checklist" />
            </FooterButton>
          </FooterTooltip>

          <FooterTooltip actionName="取消全選" actionShortcut={["Ctrl", "Shift", "A"]}>
            <FooterButton disabled={selectedCount === 0} onClick={selectNone}>
              <i className="codicon codicon-clear-all" />
            </FooterButton>
          </FooterTooltip>

          <FooterTooltip actionName="反轉選取" actionShortcut={["Ctrl", "I"]}>
            <FooterButton onClick={selectInvert}>
              <i className="codicon codicon-arrow-swap" />
            </FooterButton>
          </FooterTooltip>

          <FooterTooltip actionName="框選模式" actionShortcut={["Ctrl", "B"]}>
            <FooterButton active={isBoxSelecting} onClick={() => toggleBoxSelectionMode()}>
              <i className="codicon codicon-inspect" />
            </FooterButton>
          </FooterTooltip>
        </FooterGroup>

        <Divider orientation="vertical" flexItem />

        <FooterGroup>
          <Typography variant="caption" sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
            {clipboardCaption}
          </Typography>

          <FooterTooltip actionName="將選取紀錄到剪貼簿" actionShortcut={["Ctrl", "C"]}>
            <FooterButton disabled={selectedCount === 0} onClick={setClipboard}>
              <i className="codicon codicon-git-stash-apply" />
            </FooterButton>
          </FooterTooltip>

          <FooterTooltip actionName="貼上剪貼簿中的項目" actionShortcut={["Ctrl", "V"]}>
            <FooterButton>
              <i className="codicon codicon-git-stash" />
            </FooterButton>
          </FooterTooltip>
        </FooterGroup>
      </FooterGroups>
    </FooterContainer>
  );
};

export { FileSystemFooter };
