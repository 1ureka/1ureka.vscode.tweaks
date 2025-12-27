import { startReactApp } from "@/utils/ui";

import { readInitData } from "@explorer/store/init";
import { appStateStore } from "@explorer/store/data";
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
  panelsStub: "explorer-left-panels-stub",
  panelsContainer: "explorer-left-panels-container",
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
    minWidth: 700,
  },

  [`& .${appClassName.layout}`]: {
    display: "grid",
    gridTemplateColumns: `auto 1fr`,
    height: 1,
    width: 1,
  },

  [`& .${appClassName.panelsStub}`]: {
    width: { xs: 0, md: panelsWidth },
    transition: "width 0.3s ease",
  },
  [`& .${appClassName.panelsStub}.collapsed`]: {
    width: { xs: 0, md: 0 },
  },

  [`& .${appClassName.panelsContainer}`]: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 1,
    width: panelsWidth,
    transition: "translate 0.3s ease",
    translate: "0%",
    zIndex: 1,
  },
  [`& .${appClassName.panelsContainer}.collapsed`]: {
    translate: "-100%",
  },
};

const App = () => {
  const showLeftPanel = appStateStore((state) => state.showLeftPanel);

  return (
    <Box className={appClassName.scrollContainer} sx={containerSx}>
      <div className={appClassName.contentContainer}>
        <div className={appClassName.layout}>
          <div className={`${appClassName.panelsStub} ${showLeftPanel ? "" : "collapsed"}`} />
          <div className={`${appClassName.panelsContainer} ${showLeftPanel ? "" : "collapsed"}`}>
            <NavigationPanels />
          </div>

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
};

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
