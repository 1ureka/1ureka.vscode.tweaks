import React from "react";
import { Box } from "@mui/material";

import { fileSystemDataStore } from "./data";
import { FileSystemHeader } from "./FileSystemHeader";
import { FilterSystemOperationBar } from "./operation/FileSystemOperationBar";
import { FileSystemPagination } from "./table/FileSystemPagination";
import { FileSystemTable } from "./table/FileSystemTable";

const FileSystem: React.FC = () => {
  const pages = fileSystemDataStore((state) => state.pages);

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <FileSystemHeader />

      <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "start", gap: 1, px: 2 }}>
        <FilterSystemOperationBar />
        <Box>
          <FileSystemTable />
          {pages > 1 && <FileSystemPagination />}
        </Box>
      </Box>

      <Box sx={{ py: 1 }} />
    </Box>
  );
};

export { FileSystem };
