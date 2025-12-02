import React from "react";
import { Box, Pagination } from "@mui/material";
import { imageWallDataStore, setPage } from "./data/data";

const ImageWallPagination = () => {
  const page = imageWallDataStore((state) => state.page);
  const pages = imageWallDataStore((state) => state.pages);

  return (
    <Box sx={{ px: 2, pb: 1.5 }}>
      <Box sx={{ display: "grid", placeItems: "center", borderRadius: 1, bgcolor: "background.paper", p: 0.75 }}>
        <Pagination
          size="small"
          shape="rounded"
          count={pages}
          page={page}
          showFirstButton
          showLastButton
          onChange={(_, value) => setPage(value)}
        />
      </Box>
    </Box>
  );
};

export { ImageWallPagination };
