import React from "react";
import { Box, Container, Typography, ImageList, useMediaQuery } from "@mui/material";
import { ImageWallHeader } from "./header/ImageWallHeader";
import { ImageWallPagination } from "./header/ImageWallPagination";
import { ImageWallItem } from "./item/ImageWallItem";

import { imageWallPreferenceStore } from "./data/preference";
import { imageWallDataStore } from "./data/data";

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

const Images = () => {
  const images = imageWallDataStore((state) => state.images);
  const variant = imageWallPreferenceStore((state) => state.mode);
  const columnCounts = useColumnCounts();

  if (images.length === 0)
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="body2" color="text.secondary">
          此資料夾中沒有圖片
        </Typography>
      </Box>
    );

  return (
    <ImageList variant={variant} cols={columnCounts} gap={8} sx={{ p: 2, pt: 0, m: 0 }}>
      {images.map(({ id, metadata: { fileName, width, height } }) => (
        <ImageWallItem key={id} id={id} fileName={fileName} width={width} height={height} />
      ))}
    </ImageList>
  );
};

export const ImageWall = () => (
  <Container disableGutters maxWidth="xl" sx={{ height: "100vh", overflow: "auto" }}>
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <ImageWallHeader />
      <ImageWallPagination />
      <Images />
    </Box>
    <Box sx={{ p: 2 }} />
  </Container>
);
