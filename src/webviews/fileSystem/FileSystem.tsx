import React from "react";
import { Box, LinearProgress } from "@mui/material";
import { FileSystemHeader } from "./header/FileSystemHeader";
import { FilterSystemOperationBar } from "./operation/FileSystemOperationBar";
import { FileSystemTable } from "./table/FileSystemTable";
import { fileSystemDataStore } from "./data/data";

const loadingContainerSx = {
  position: "fixed",
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

const FileSystem = () => (
  <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
    <FileSystemHeader />

    <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "start", gap: 1, px: 2 }}>
      <FilterSystemOperationBar />
      <FileSystemTable />
    </Box>

    <Box sx={{ py: 1 }} />

    <LoadingDisplay />
  </Box>
);

export { FileSystem };
