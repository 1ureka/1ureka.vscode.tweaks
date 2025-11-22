import React from "react";
import { ThemeProvider, createTheme, Skeleton } from "@mui/material";
import { Box, Container, Typography, useMediaQuery, ButtonBase } from "@mui/material";
import { ImageList, ImageListItem, ImageListItemBar } from "@mui/material";
import { getInitialData, postMessageToExtension } from "../utils/vscodeApi";
import type sharp from "sharp";

type ImageInfo = {
  metadata: { fileName: string; filePath: string } & sharp.Metadata;
  uri: string;
};

const data = getInitialData<{ images: ImageInfo[]; folderPath: string }>() || {
  images: [],
  folderPath: "",
};

const createHandleClick = (filePath: string) => () => {
  postMessageToExtension({ type: "imageClick", filePath });
};

const ImageWallTitle = ({ folderPath, imageCount }: { folderPath: string; imageCount: number }) => (
  <Box sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: "divider" }}>
    <Typography variant="h4" component="h2" gutterBottom>
      圖片牆
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-all" }}>
      {folderPath}
    </Typography>
    {imageCount > 0 && (
      <Typography variant="body2" color="text.secondary">
        共 {imageCount} 張圖片
      </Typography>
    )}
  </Box>
);

const useColumnCounts = () => {
  const isXl = useMediaQuery((theme) => theme.breakpoints.up("xl"));
  const isLg = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const isMd = useMediaQuery((theme) => theme.breakpoints.up("md"));
  const isSm = useMediaQuery((theme) => theme.breakpoints.up("sm"));

  if (isXl) return 5;
  if (isLg) return 4;
  if (isMd) return 3;
  if (isSm) return 2;
  return 1;
};

const ellipsisSx = {
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  wordBreak: "break-all",
} as const;

const skeletonTheme = createTheme({
  defaultColorScheme: "dark",
  colorSchemes: {
    dark: { palette: { text: { primary: "#ffffff" } } },
  },
});

const Images = ({ images }: { images: ImageInfo[] }) => {
  const columnCounts = useColumnCounts();

  return (
    <ImageList variant="masonry" cols={columnCounts} gap={8} sx={{ py: 1 }}>
      {images.map(({ uri, metadata: { fileName, filePath, width, height } }) => (
        <ImageListItem
          key={uri}
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 1,
            boxShadow: 1,

            "&:hover": { boxShadow: 3, transform: "translateY(-4px)" },
            "&:hover > button": { bgcolor: "action.hover" },
            "&:hover > .image-list-item-bar": { opacity: 1 },

            transition: "transform 0.2s, box-shadow 0.2s",
            "& > button": { transition: "background-color 0.2s" },
            "& > .image-list-item-bar": { transition: "opacity 0.2s" },
          }}
        >
          <Box sx={{ position: "relative", width: 1, height: "auto", aspectRatio: `${width} / ${height}` }}>
            <ThemeProvider theme={skeletonTheme}>
              <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
            </ThemeProvider>
            {/* <img
              src={uri}
              alt={fileName}
              loading="lazy"
              decoding="async"
              style={{ position: "absolute", inset: 0, display: "block" }}
            /> */}
          </Box>
          <ImageListItemBar
            title={fileName}
            sx={{ ...ellipsisSx, opacity: 0, fontFamily: "Noto Sans TC" }}
            className="image-list-item-bar"
          />
          <ButtonBase sx={{ position: "absolute", inset: 0, zIndex: 1 }} onClick={createHandleClick(filePath)} />
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
