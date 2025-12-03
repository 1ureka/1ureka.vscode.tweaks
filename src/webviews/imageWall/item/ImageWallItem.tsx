import React from "react";
import { ImageListItem, type SxProps } from "@mui/material";
import { ImageWallItemBar, imageWallItemBarClassName } from "./ImageWallItemBar";
import { ImageWallItemDisplay } from "./ImageWallItemDisplay";
import { ImageWallItemButton } from "./ImageWallItemButton";

type ImageWallItemProps = {
  id: string;
  fileName: string;
  width: number;
  height: number;
};

const imageWallItemSx: SxProps = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 1,
  boxShadow: 1,

  "&:hover": { boxShadow: 3, transform: "translateY(-4px)" },
  "&:hover > button": { bgcolor: "action.hover" },
  [`&:hover > .${imageWallItemBarClassName}`]: { opacity: 1 },

  transition: "transform 0.2s, box-shadow 0.2s",
  "& > button": { transition: "background-color 0.2s" },
  [`& > .${imageWallItemBarClassName}`]: { transition: "opacity 0.2s" },
};

const ImageWallItem = ({ id, fileName, width, height }: ImageWallItemProps) => (
  <ImageListItem sx={imageWallItemSx}>
    <ImageWallItemDisplay id={id} fileName={fileName} width={width} height={height} />
    <ImageWallItemBar fileName={fileName} width={width} height={height} />
    <ImageWallItemButton id={id} />
  </ImageListItem>
);

export { ImageWallItem };
