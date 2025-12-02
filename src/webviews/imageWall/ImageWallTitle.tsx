import React from "react";
import { Box, Breadcrumbs, Typography } from "@mui/material";
import { imageWallDataStore } from "./data/data";

const ImageWallTitle = () => {
  const folderPathParts = imageWallDataStore((state) => state.folderPathParts);
  const totalImages = imageWallDataStore((state) => state.totalImages);

  return (
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap", p: 2 }}>
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<span className="codicon codicon-chevron-right" />}
        sx={{ "& .MuiBreadcrumbs-separator": { mx: 0.5 } }}
      >
        {folderPathParts.map((part, index) => (
          <Typography
            key={index}
            color={index === folderPathParts.length - 1 ? "text.primary" : "text.secondary"}
            sx={{ wordBreak: "break-all", display: "flex", alignItems: "center" }}
          >
            {index === folderPathParts.length - 1 && (
              <span className="codicon codicon-folder" style={{ marginRight: 4 }}></span>
            )}
            {part}
          </Typography>
        ))}
      </Breadcrumbs>

      <Typography color="text.secondary">•</Typography>

      <Typography color="text.secondary">共 {totalImages} 張圖片</Typography>
    </Box>
  );
};

export { ImageWallTitle };
