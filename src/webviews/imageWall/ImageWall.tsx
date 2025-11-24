import React from "react";
import { Box, Container, Typography, useMediaQuery } from "@mui/material";
import { ImageList, ImageListItem } from "@mui/material";

import { ImageWallTitle } from "./ImageWallTitle";
import { ImageListItemBar, imageListItemBarClassName } from "./ImageListItemBar";
import { ImageClickControl } from "./ImageClickControl";
import { ImageDisplay } from "./ImageDisplay";

import type { ImageWallInitialData } from "../../commands/imageWallCommands";
import { getInitialData } from "../utils/vscodeApi";
import { imageWallPreferenceStore } from "./events";

const data = getInitialData<ImageWallInitialData>() || {
  folderPath: "",
  folderPathParts: [],
  images: [],
};

const columnCountsMap = {
  s: { xl: 7, lg: 6, md: 5, sm: 4, xs: 3 },
  m: { xl: 5, lg: 4, md: 3, sm: 2, xs: 1 },
  l: { xl: 4, lg: 3, md: 2, sm: 1, xs: 1 },
};

const useColumnCounts = () => {
  const columnSize = imageWallPreferenceStore((state) => state.columnSize);

  const isXl = useMediaQuery((theme) => theme.breakpoints.up("xl"));
  const isLg = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const isMd = useMediaQuery((theme) => theme.breakpoints.up("md"));
  const isSm = useMediaQuery((theme) => theme.breakpoints.up("sm"));

  const currentSizeMap = columnCountsMap[columnSize];

  if (isXl) return currentSizeMap.xl;
  if (isLg) return currentSizeMap.lg;
  if (isMd) return currentSizeMap.md;
  if (isSm) return currentSizeMap.sm;
  return currentSizeMap.xs;
};

const Images = ({ images }: { images: ImageWallInitialData["images"] }) => {
  const variant = imageWallPreferenceStore((state) => state.mode);
  const columnCounts = useColumnCounts();

  return (
    <ImageList variant={variant} cols={columnCounts} gap={8} sx={{ py: 1 }}>
      {images.map(({ id, metadata: { fileName, width, height } }) => (
        <ImageListItem
          key={id}
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 1,
            boxShadow: 1,

            "&:hover": { boxShadow: 3, transform: "translateY(-4px)" },
            "&:hover > button": { bgcolor: "action.hover" },
            [`&:hover > .${imageListItemBarClassName}`]: { opacity: 1 },

            transition: "transform 0.2s, box-shadow 0.2s",
            "& > button": { transition: "background-color 0.2s" },
            [`& > .${imageListItemBarClassName}`]: { transition: "opacity 0.2s" },
          }}
        >
          <ImageDisplay id={id} fileName={fileName} width={width} height={height} />
          <ImageListItemBar fileName={fileName} width={width} height={height} />
          <ImageClickControl id={id} />
        </ImageListItem>
      ))}
    </ImageList>
  );
};

export const ImageWall: React.FC = () => {
  const { images, folderPath } = data;

  if (images.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 3, height: "100vh", overflow: "auto" }}>
        <ImageWallTitle folderPath={folderPath} imageCount={0} />
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            此資料夾中沒有圖片
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3, height: "100vh", overflow: "auto" }}>
      <ImageWallTitle folderPath={folderPath} imageCount={images.length} />
      <Images images={images} />
    </Container>
  );
};
