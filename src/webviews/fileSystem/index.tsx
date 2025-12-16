import React from "react";
import { createRoot } from "react-dom/client";
import { Providers } from "@/utils/ui";

import { Box } from "@mui/material";
import { registerInitData } from "@@/fileSystem/data/data";
import { registerSelectionEvents } from "@@/fileSystem/data/selection";
import { registerNavigateShortcuts } from "@@/fileSystem/data/navigate";
import { registerMessageEvents } from "@@/fileSystem/data/message";
import { registerClipboardEvents } from "@@/fileSystem/data/clipboard";
import { NavigationPanels } from "@@/fileSystem/layout/NavigationPanels";
import { ActionButton, ActionDropdown, ActionGroup, ActionInput } from "@@/fileSystem/components/Action";

const App = () => {
  return (
    <Providers>
      <Box sx={{ height: "100dvh", width: "100dvw", overflow: "hidden", overflowX: "auto" }}>
        <Box sx={{ minWidth: 850, display: "grid", gridTemplateColumns: "270px 1fr", p: 0.5, height: 1 }}>
          <NavigationPanels />

          <Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "auto auto 2fr 1fr auto auto", gap: 1, p: 1 }}>
              <ActionGroup>
                <ActionButton icon="codicon codicon-arrow-left" />
                <ActionButton icon="codicon codicon-arrow-right" />
                <ActionButton icon="codicon codicon-merge-into" />
                <ActionButton icon="codicon codicon-sync" />
              </ActionGroup>

              <ActionGroup>
                <ActionButton icon="codicon codicon-new-folder" />
              </ActionGroup>

              <ActionGroup>
                <ActionInput />
              </ActionGroup>

              <ActionGroup>
                <ActionInput icon="codicon codicon-search" placeholder="搜尋" />
              </ActionGroup>

              <ActionGroup>
                <ActionButton icon="codicon codicon-list-ordered" active />
                <ActionButton icon="codicon codicon-table" disabled />
                <ActionDropdown>
                  <Box sx={{ p: 2, px: 5 }} />
                </ActionDropdown>
              </ActionGroup>

              <ActionGroup>
                <ActionButton icon="codicon codicon-filter" active />
                <ActionDropdown>
                  <Box sx={{ p: 2, px: 5 }} />
                </ActionDropdown>
              </ActionGroup>
            </Box>
          </Box>
        </Box>
      </Box>
    </Providers>
  );
};

/**
 * 測量指定字串在特定等寬字體下的像素寬度。
 */
function measureTextWidth(text: string, font: string): number {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    console.error("無法取得 Canvas 2D 上下文。");
    return 0;
  }

  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
}

const container = document.getElementById("root");
if (container) {
  container.style.setProperty("scrollbar-color", "initial", "important");
  registerInitData();
  registerSelectionEvents();
  registerNavigateShortcuts();
  registerMessageEvents();
  registerClipboardEvents();
  createRoot(container).render(<App />);
}

document.body.style.padding = "0";
document.body.style.overflow = "hidden";
