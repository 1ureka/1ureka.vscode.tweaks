import React from "react";
import { Box } from "@mui/material";
import { fileSystemDataStore } from "./data";
import { FileSystemHeader } from "./FileSystemHeader";
import { FileSystemTable } from "./FileSystemTable";
import { FileSystemPagination } from "./FileSystemPagination";

const FileSystem: React.FC = () => {
  const pages = fileSystemDataStore((state) => state.pages);

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <FileSystemHeader />
      <FileSystemTable />
      {pages > 1 && <FileSystemPagination />}
      <Box sx={{ py: 1 }} />
    </Box>
  );
};

export { FileSystem };
