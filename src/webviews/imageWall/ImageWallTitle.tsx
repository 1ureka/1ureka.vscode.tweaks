import React from "react";
import { Box, Breadcrumbs, Typography } from "@mui/material";
import type { ImageWallInitialData } from "../../commands/imageWallCommands";

type ImageWallTitleProps = Pick<ImageWallInitialData, "folderPathParts"> & { imageCount: number };

const ImageWallTitle = ({ folderPathParts, imageCount }: ImageWallTitleProps) => (
  <Box sx={{ pb: 2, display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
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

    <Typography>共 {imageCount} 張圖片</Typography>
  </Box>
);

export { ImageWallTitle };
