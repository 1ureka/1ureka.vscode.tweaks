import { startReactApp } from "@/utils/ui";

import { readInitData } from "@explorer/store/init";
import { setupDependencyChain } from "@explorer/store/dependency";
import { registerAllShortcuts } from "@explorer/action/shortcuts";

import { Box, type SxProps } from "@mui/material";
import { LoadingDisplay } from "@explorer/layout/LoadingDisplay";
import { NavigationPanels } from "@explorer/layout/NavigationPanels";
import { NavigationBar } from "@explorer/layout/NavigationBar";
import { TableHead } from "@explorer/layout-table/TableHead";
import { TableBody } from "@explorer/layout-table/TableBody";
import { ActionBar } from "@explorer/layout/ActionBar";
import { ImageGrid } from "@explorer/layout-grid/ImageGrid";

const appClassName = {
  scrollContainer: "explorer-scroll-container",
  contentContainer: "explorer-content-container",
  layout: "explorer-layout",
};

const panelsWidth = 270;

const containerSx: SxProps = {
  position: "relative",
  height: "100dvh",
  width: "100dvw",
  overflow: "hidden",
  overflowX: "auto",

  [`& .${appClassName.contentContainer}`]: {
    position: "relative",
    height: 1,
    minWidth: 850,
  },

  [`& .${appClassName.layout}`]: {
    display: "grid",
    gridTemplateColumns: `${panelsWidth}px 1fr`,
    height: 1,
    width: 1,
  },
};

const App = () => (
  <Box className={appClassName.scrollContainer} sx={containerSx}>
    <div className={appClassName.contentContainer}>
      <div className={appClassName.layout}>
        <NavigationPanels />
        <Box sx={{ p: 1, display: "flex", flexDirection: "column", height: 1, minHeight: 0 }}>
          <NavigationBar />
          <TableHead />
          <TableBody />
          <ActionBar />
          <ImageGrid />
        </Box>
      </div>
      <LoadingDisplay />
    </div>
  </Box>
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
