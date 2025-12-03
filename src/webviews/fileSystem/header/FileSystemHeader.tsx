import React from "react";
import { FileSystemBreadcrumb } from "./FileSystemBreadcrumb";
import { Box, Typography } from "@mui/material";
import { fileSystemDataStore } from "../data/data";

const FileSystemHeader = () => {
  const fileCount = fileSystemDataStore((state) => state.fileCount);
  const folderCount = fileSystemDataStore((state) => state.folderCount);

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", p: 2 }}>
      <FileSystemBreadcrumb />

      <Typography variant="body2" color="text.secondary">
        •
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {folderCount} 個資料夾
      </Typography>
      <Typography variant="body2" color="text.secondary">
        •
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {fileCount} 個檔案
      </Typography>
    </Box>
  );
};

export { FileSystemHeader };
