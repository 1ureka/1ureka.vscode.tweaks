import React from "react";
import { Pagination, Box } from "@mui/material";
import { fileSystemDataStore } from "./data";
import { navigateToPage } from "./navigate";

const FileSystemPagination: React.FC = () => {
  const page = fileSystemDataStore((state) => state.page);
  const pages = fileSystemDataStore((state) => state.pages);

  if (pages <= 1) return null;

  return (
    <Box sx={{ px: 2, pb: 1.5, pt: 0.5 }}>
      <Box sx={{ display: "grid", placeItems: "center", borderRadius: 1, bgcolor: "background.paper", p: 0.75 }}>
        <Pagination
          size="small"
          shape="rounded"
          count={pages}
          page={page}
          showFirstButton
          showLastButton
          onChange={(_, value) => navigateToPage(value)}
        />
      </Box>
    </Box>
  );
};

export { FileSystemPagination };
