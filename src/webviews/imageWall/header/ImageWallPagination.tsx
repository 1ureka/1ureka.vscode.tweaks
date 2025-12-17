import { imageWallViewState, setPage } from "@@/imageWall/data/view";
import { Box, Pagination } from "@mui/material";

const ImageWallPagination = () => {
  const page = imageWallViewState((state) => state.page);
  const pages = imageWallViewState((state) => state.totalPages);

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
