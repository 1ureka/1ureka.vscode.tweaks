import React from "react";
import { ImageListItemBar as MuiImageListItemBar } from "@mui/material";

const imageListItemBarClassName = "image-list-item-bar" as const;

const ellipsisSx = {
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  wordBreak: "break-all",
} as const;

type ImageListItemBarProps = {
  fileName: string;
  width: number;
  height: number;
};

const ImageListItemBar = ({ fileName, width, height }: ImageListItemBarProps) => (
  <MuiImageListItemBar
    title={fileName}
    subtitle={`${width}px x ${height}px`}
    sx={{
      ...ellipsisSx,
      opacity: 0,
      "& .MuiImageListItemBar-titleWrap": { p: 1.5, pt: 1 },
      "& .MuiImageListItemBar-subtitle": { color: "text.secondary" },
    }}
    className={imageListItemBarClassName}
  />
);

export { ImageListItemBar, imageListItemBarClassName };
