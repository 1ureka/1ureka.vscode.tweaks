import { startReactApp } from "@/utils/ui";

import { registerInitData } from "@@/fileSystem/data/data";
import { registerSelectionEvents } from "@@/fileSystem/data/selection";
import { registerNavigateShortcuts } from "@@/fileSystem/data/navigate";
import { registerMessageEvents } from "@@/fileSystem/data/message";
import { registerClipboardEvents } from "@@/fileSystem/data/clipboard";

import { Box } from "@mui/material";
import { NavigationPanels } from "@@/fileSystem/layout/NavigationPanels";
import { NavigationBar } from "@@/fileSystem/layout/NavigationBar";

const App = () => (
  <Box sx={{ height: "100dvh", width: "100dvw", overflow: "hidden", overflowX: "auto" }}>
    <Box sx={{ minWidth: 850, display: "grid", gridTemplateColumns: "270px 1fr", height: 1 }}>
      <NavigationPanels />
      <Box>
        <NavigationBar />
      </Box>
    </Box>
  </Box>
);

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
