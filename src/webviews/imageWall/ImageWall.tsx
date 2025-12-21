import { Box, Container, Typography, ImageList, useMediaQuery } from "@mui/material";
import { ImageWallHeader } from "@@/imageWall/header/ImageWallHeader";
import { ImageWallPagination } from "@@/imageWall/header/ImageWallPagination";
import { ImageWallItem } from "@@/imageWall/item/ImageWallItem";

import { imageWallPreferenceStore } from "@@/imageWall/data/preference";
import { imageWallDataStore } from "@@/imageWall/data/data";
import { imageWallViewData } from "@@/imageWall/data/view";
import type { ImageMetadata } from "@/utils/image";

const columnCountsMap = {
  s: { xl: 7, lg: 6, md: 5, sm: 4, xs: 3 },
  m: { xl: 5, lg: 4, md: 3, sm: 2, xs: 1 },
  l: { xl: 4, lg: 3, md: 2, sm: 1, xs: 1 },
};

/** 根據螢幕尺寸和偏好設定的欄位大小，計算出當前應該顯示的欄位數 */
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

/** 顯示圖片列表 */
const ImageWallList = ({ images }: { images: ImageMetadata[] }) => {
  const variant = imageWallPreferenceStore((state) => state.mode);
  const columnCounts = useColumnCounts();

  return (
    <ImageList variant={variant} cols={columnCounts} gap={8} sx={{ p: 2, pt: 0, m: 0, overflow: "visible" }}>
      {images.map(({ filePath, fileName, width, height }) => (
        <ImageWallItem key={filePath} filePath={filePath} fileName={fileName} width={width} height={height} />
      ))}
    </ImageList>
  );
};

/** 根據是否在初始載入或是否有圖片，顯示不同的內容 */
const ImageWallBody = () => {
  const images = imageWallViewData((state) => state.images);
  const initialLoading = imageWallDataStore((state) => state.initialLoading);

  if (images.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="body2" color="text.secondary">
          {initialLoading ? "載入中..." : "此資料夾中沒有圖片"}
        </Typography>
      </Box>
    );
  } else {
    return (
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <ImageWallPagination />
        <ImageWallList images={images} />
      </Box>
    );
  }
};

/** 圖片牆 */
export const ImageWall = () => (
  <Container disableGutters maxWidth="xl" sx={{ height: "100vh", overflow: "auto" }}>
    <ImageWallHeader />
    <ImageWallBody />
    <Box sx={{ p: 2 }} />
  </Container>
);
