import { Box, Typography } from "@mui/material";
import { fileSystemViewDataStore, fileSystemViewStore } from "../data/view";

const NoItemDisplay = () => {
  const viewEntries = fileSystemViewDataStore((state) => state.entries);
  const filter = fileSystemViewStore((state) => state.filter);

  if (viewEntries.length > 0) {
    return null;
  }

  let message = "此資料夾是空的";

  if (filter === "file") {
    message = "此資料夾中沒有檔案";
  } else if (filter === "folder") {
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

export { NoItemDisplay };
