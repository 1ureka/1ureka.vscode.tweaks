import { colorMix, startReactApp } from "@/utils/ui";

import { registerInitData } from "@@/fileSystem/data/data";
import { registerSelectionEvents } from "@@/fileSystem/data/selection";
import { registerNavigateShortcuts } from "@@/fileSystem/data/navigate";
import { registerMessageEvents } from "@@/fileSystem/data/message";
import { registerClipboardEvents } from "@@/fileSystem/data/clipboard";

import { Box } from "@mui/material";
import { NavigationPanels } from "@@/fileSystem/layout/NavigationPanels";
import { NavigationBar } from "@@/fileSystem/layout/NavigationBar";
import { TableHead } from "@@/fileSystem/layout/TableHead";
import { tableRowHeight } from "@@/fileSystem/layout/tableConfig";

const Container = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ height: "100dvh", width: "100dvw", overflow: "hidden", overflowX: "auto" }}>
    <Box sx={{ minWidth: 850, display: "grid", gridTemplateColumns: "270px 1fr", height: 1 }}>{children}</Box>
  </Box>
);

const App = () => (
  <Container>
    <NavigationPanels />
    <Box sx={{ p: 1, display: "flex", flexDirection: "column", height: 1, minHeight: 0 }}>
      <NavigationBar />
      <TableHead />
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          scrollbarGutter: "stable",
          minHeight: 0,
          borderRadius: 1,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          backgroundImage: `linear-gradient(var(--mui-palette-background-content) 50%, ${colorMix(
            "background.content",
            "text.primary",
            0.97
          )} 50%)`,
          backgroundSize: `100% ${tableRowHeight * 2}px`,
          backgroundRepeat: "repeat",
        }}
      >
        {/* TODO: table content */}
        <Box>
          {new Array(50).fill(null).map((_, index) => (
            <Box key={index} sx={{ height: tableRowHeight }} />
          ))}
        </Box>
      </Box>
    </Box>
  </Container>
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
