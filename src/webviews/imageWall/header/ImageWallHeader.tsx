import { Box, Breadcrumbs, Typography } from "@mui/material";
import { imageWallDataStore } from "../data/data";
import { formatPathArray } from "@/utils/formatter";

const ImageWallHeader = () => {
  const folderPathParts = imageWallDataStore((state) => state.folderPathParts);
  const totalImages = imageWallDataStore((state) => state.images.length);

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", p: 2 }}>
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<span className="codicon codicon-chevron-right" />}
        sx={{ "& .MuiBreadcrumbs-separator": { mx: 0.5 } }}
      >
        {formatPathArray(folderPathParts).map((part, index) => (
          <Typography
            key={index}
            variant="body2"
            color={index === folderPathParts.length - 1 ? "text.primary" : "text.secondary"}
            sx={{ wordBreak: "break-all", display: "flex", alignItems: "center" }}
          >
            {index === folderPathParts.length - 1 && (
              <span className="codicon codicon-folder" style={{ marginRight: 4 }} />
            )}
            {part}
          </Typography>
        ))}
      </Breadcrumbs>

      <Typography variant="body2" color="text.secondary">
        •
      </Typography>

      <Typography variant="body2" color="text.secondary">
        共 {totalImages} 張圖片
      </Typography>
    </Box>
  );
};

export { ImageWallHeader };
