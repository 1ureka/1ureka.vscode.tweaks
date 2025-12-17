import { startReactApp } from "@/utils/ui";

import { registerInitDataEvents } from "@@/fileSystem/events/data";
import { registerMessageEvents } from "@@/fileSystem/events/message";
import { registerClipboardEvents } from "@@/fileSystem/events/clipboard";
import { registerNavigateShortcuts, registerSelectionShortcuts } from "@@/fileSystem/events/shortcuts";
import { setupDependencyChain } from "@@/fileSystem/store/dependency";

import { Box } from "@mui/material";
import { NavigationPanels } from "@@/fileSystem/layout/NavigationPanels";
import { NavigationBar } from "@@/fileSystem/layout/NavigationBar";
import { TableHead } from "@@/fileSystem/layout/TableHead";
import { TableBody } from "@@/fileSystem/layout/TableBody";
import { LoadingDisplay } from "@@/fileSystem/layout/LoadingDisplay";

const Container = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ position: "relative", height: "100dvh", width: "100dvw", overflow: "hidden", overflowX: "auto" }}>
    <Box sx={{ minWidth: 850, display: "grid", gridTemplateColumns: "270px 1fr", height: 1 }}>{children}</Box>
    <LoadingDisplay />
  </Box>
);

const App = () => (
  <Container>
    <NavigationPanels />
    <Box sx={{ p: 1, display: "flex", flexDirection: "column", height: 1, minHeight: 0 }}>
      <NavigationBar />
      <TableHead />
      <TableBody />
    </Box>
  </Container>
);

startReactApp({
  App,
  beforeRender: () => {
    setupDependencyChain();
    registerInitDataEvents();
    registerSelectionShortcuts();
    registerNavigateShortcuts();
    registerMessageEvents();
    registerClipboardEvents();
  },
});
