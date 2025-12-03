import React from "react";
import { Box, LinearProgress } from "@mui/material";
import { fileSystemDataStore } from "./data/data";
import { FileSystemHeader } from "./header/FileSystemHeader";
import { FileSystemTable } from "./table/FileSystemTable";
import { FileSystemFooter } from "./footer/FileSystemFooter";

const loadingContainerSx = {
  position: "absolute",
  inset: "0",
  pointerEvents: "none",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "stretch",
  animation: "progressDelay 0.15s steps(1, end)",
  "@keyframes progressDelay": {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
};

const LoadingDisplay = () => {
  const loading = fileSystemDataStore((state) => state.loading);

  if (!loading) return null;

  return (
    <Box sx={loadingContainerSx}>
      <LinearProgress sx={{ width: 1, height: 6 }} color="info" />
    </Box>
  );
};

const FileSystemBodyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Box
    id="file-system-body-wrapper"
    sx={{ position: "relative", display: "flex", flexDirection: "column", overflow: "auto", flex: 1, minHeight: 0 }}
  >
    {children}
  </Box>
);

const FileSystem = () => (
  <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
    <FileSystemBodyWrapper>
      <FileSystemHeader />
      <FileSystemTable />
      <LoadingDisplay />
    </FileSystemBodyWrapper>
    <FileSystemFooter />
  </Box>
);

export { FileSystem };
