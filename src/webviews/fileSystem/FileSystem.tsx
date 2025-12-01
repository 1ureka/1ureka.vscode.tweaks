import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";
import { fileSystemViewDataStore, fileSystemViewStore } from "./data/view";

import { FileSystemHeader } from "./header/FileSystemHeader";
import { FilterSystemOperationBar } from "./operation/FileSystemOperationBar";
import { FileSystemPagination } from "./table/FileSystemPagination";
import { FileSystemTable } from "./table/FileSystemTable";
import { fileSystemDataStore } from "./data/data";

const NoItemDisplay = () => {
  const viewEntries = fileSystemViewDataStore((state) => state.entries);
  const filter = fileSystemViewStore((state) => state.filter);

  if (viewEntries.length > 0) {
    return null;
  }

  let message = "此資料夾是空的";

  if (filter === "file") {
    message = "此資料夾中沒有檔案";
  } else if (filter === "folder") {
    message = "此資料夾中沒有資料夾";
  }

  return (
    <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
      <Typography color="text.secondary" variant="body2">
        {message}
      </Typography>
    </Box>
  );
};

const TableSection = () => {
  const pages = fileSystemViewStore((state) => state.pages);

  return (
    <Box>
      <FileSystemTable />
      {pages > 1 && <FileSystemPagination />}
      <NoItemDisplay />
    </Box>
  );
};

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
      <TableSection />
    </Box>

    <Box sx={{ py: 1 }} />

    <LoadingDisplay />
  </Box>
);

export { FileSystem };
