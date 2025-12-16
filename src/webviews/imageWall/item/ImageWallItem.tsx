import { ImageListItem, type SxProps } from "@mui/material";
import { ImageWallItemBar, imageWallItemBarClassName } from "@@/imageWall/item/ImageWallItemBar";
import { ImageWallItemDisplay } from "@@/imageWall/item/ImageWallItemDisplay";
import { ImageWallItemButton } from "@@/imageWall/item/ImageWallItemButton";

type ImageWallItemProps = {
  filePath: string;
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

const ImageWallItem = (props: ImageWallItemProps) => (
  <ImageListItem id={props.filePath} sx={imageWallItemSx}>
    <ImageWallItemDisplay {...props} />
    <ImageWallItemBar {...props} />
    <ImageWallItemButton {...props} />
  </ImageListItem>
);

export { ImageWallItem };
