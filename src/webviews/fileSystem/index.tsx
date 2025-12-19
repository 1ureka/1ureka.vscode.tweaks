import { startReactApp } from "@/utils/ui";

import { readInitData } from "@@/fileSystem/store/init";
import { setupDependencyChain } from "@@/fileSystem/store/dependency";
import { registerAllShortcuts } from "@@/fileSystem/action/shortcuts";

import { Box } from "@mui/material";
import { LoadingDisplay } from "@@/fileSystem/layout/LoadingDisplay";
import { NavigationPanels } from "@@/fileSystem/layout/NavigationPanels";
import { NavigationBar } from "@@/fileSystem/layout/NavigationBar";
import { TableHead } from "@@/fileSystem/layout/TableHead";
import { TableBody } from "@@/fileSystem/layout/TableBody";
import { ActionBar } from "@@/fileSystem/layout/ActionBar";

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
