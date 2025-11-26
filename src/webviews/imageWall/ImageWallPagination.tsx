import React from "react";
import { Box, Pagination } from "@mui/material";
import { imageWallDataStore, setPage } from "./data";

const ImageWallPagination = () => {
  const page = imageWallDataStore((state) => state.page);
  const pages = imageWallDataStore((state) => state.pages);

  return (
    <Box sx={{ display: "grid", placeItems: "center" }}>
      <Pagination
        shape="rounded"
        count={pages}
        page={page}
        showFirstButton
        showLastButton
        onChange={(_, value) => setPage(value)}
      />
    </Box>
  );
};

export { ImageWallPagination };
