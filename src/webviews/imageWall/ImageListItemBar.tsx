import React from "react";
import { ImageListItemBar as MuiImageListItemBar } from "@mui/material";
import { ellipsisSx } from "../utils/Providers";

const imageListItemBarClassName = "image-list-item-bar" as const;

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
