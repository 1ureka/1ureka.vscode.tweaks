import React from "react";
import { Box, Typography } from "@mui/material";

import { fileSystemDataStore } from "./data";
import { FileSystemHeader } from "./FileSystemHeader";
import { FilterSystemOperationBar } from "./operation/FileSystemOperationBar";
import { FileSystemPagination } from "./table/FileSystemPagination";
import { FileSystemTable } from "./table/FileSystemTable";

const NoItemDisplay = () => {
  const files = fileSystemDataStore((state) => state.files);
  const filter = fileSystemDataStore((state) => state.filter);

  if (files.length > 0) {
    return null;
  }

  let message = "此資料夾是空的";

  if (filter === "files") {
    message = "此資料夾中沒有檔案";
  } else if (filter === "folders") {
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
  const pages = fileSystemDataStore((state) => state.pages);

  return (
    <Box>
      <FileSystemTable />
      {pages > 1 && <FileSystemPagination />}
      <NoItemDisplay />
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
  </Box>
);

export { FileSystem };
