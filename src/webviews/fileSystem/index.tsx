import React from "react";
import { startReactApp } from "@/utils/ui";

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
    <Box sx={{ height: "100dvh", width: "100dvw", overflow: "hidden", overflowX: "auto" }}>
      <Box sx={{ minWidth: 850, display: "grid", gridTemplateColumns: "270px 1fr", height: 1 }}>
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
  );
};

startReactApp({
  App,
  beforeRender: () => {
    registerInitData();
    registerSelectionEvents();
    registerNavigateShortcuts();
    registerMessageEvents();
    registerClipboardEvents();
  },
});
