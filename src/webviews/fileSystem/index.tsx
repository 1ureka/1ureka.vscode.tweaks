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

const App = () => {
  return (
    <Providers>
      <Box sx={{ height: "100dvh", width: "100dvw", overflow: "hidden", overflowX: "auto" }}>
        <Box sx={{ minWidth: 750, display: "grid", gridTemplateColumns: "270px 1fr", p: 0.5, height: 1 }}>
          <NavigationPanels />
        </Box>
      </Box>
    </Providers>
  );
};

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
