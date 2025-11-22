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

const ImageListItemBar = ({ fileName }: { fileName: string }) => (
  <MuiImageListItemBar
    title={fileName}
    sx={{ ...ellipsisSx, opacity: 0, fontFamily: "Noto Sans TC" }}
    className={imageListItemBarClassName}
  />
);

export { ImageListItemBar, imageListItemBarClassName };
