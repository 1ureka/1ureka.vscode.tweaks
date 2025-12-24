import { startReactApp } from "@/utils/ui";

import { readInitData } from "@explorer/store/init";
import { setupDependencyChain } from "@explorer/store/dependency";
import { registerAllShortcuts } from "@explorer/action/shortcuts";

import { Box } from "@mui/material";
import { LoadingDisplay } from "@explorer/layout/LoadingDisplay";
import { NavigationPanels } from "@explorer/layout/NavigationPanels";
import { NavigationBar } from "@explorer/layout/NavigationBar";
import { TableHead } from "@explorer/layout_table/TableHead";
import { TableBody } from "@explorer/layout_table/TableBody";
import { ActionBar } from "@explorer/layout/ActionBar";
import { ImageGrid } from "@explorer/layout_grid/ImageGrid";

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
      <ActionBar />
      <ImageGrid />
    </Box>
  </Container>
);

startReactApp({
  App,
  beforeRender: () => {
    setupDependencyChain();
    readInitData();
    registerAllShortcuts();

    window.addEventListener(
      "contextmenu",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
      },
      true
    );
  },
});
