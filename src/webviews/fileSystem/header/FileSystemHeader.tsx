import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { FileSystemBreadcrumb } from "./FileSystemBreadcrumb";
import { FooterTooltip } from "../footer/FileSystemFooterTooltip";
import { fileSystemDataStore } from "../data/data";
import { navigateToPath } from "../data/navigate";

const FileSystemHeader = () => {
  const fileCount = fileSystemDataStore((state) => state.fileCount);
  const folderCount = fileSystemDataStore((state) => state.folderCount);

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mr: 0.5, height: 20, overflow: "visible" }}>
        <FooterTooltip actionName="前往指定目錄" actionShortcut={["Ctrl", "G"]}>
          <Button
            variant="contained"
            disableElevation
            size="small"
            sx={{ py: 0.25, px: 0.75, transition: "none", gap: 0.5, "&:hover": { bgcolor: "primary.light" } }}
            onClick={navigateToPath}
          >
            <i className="codicon codicon-cursor" style={{ display: "block" }} />
            <Typography variant="caption">前往</Typography>
          </Button>
        </FooterTooltip>
      </Box>

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
