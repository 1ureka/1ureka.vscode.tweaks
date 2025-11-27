import React from "react";
import { FileSystemBreadcrumb } from "./FileSystemBreadcrumb";
import { Box, Typography } from "@mui/material";
import { fileSystemDataStore } from "./data";

const FileSystemHeader = () => {
  const fileCount = fileSystemDataStore((state) => state.fileCount);
  const folderCount = fileSystemDataStore((state) => state.folderCount);

  return (
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap", p: 2 }}>
      <FileSystemBreadcrumb />
      <Typography color="text.secondary">•</Typography>
      <Typography color="text.secondary">{folderCount} 個資料夾</Typography>
      <Typography color="text.secondary">•</Typography>
      <Typography color="text.secondary">{fileCount} 個檔案</Typography>
    </Box>
  );
};

export { FileSystemHeader };
