import { ImageListItemBar as MuiImageListItemBar, type SxProps } from "@mui/material";
import { ellipsisSx } from "@/utils/ui";

const imageWallItemBarClassName = "image-list-item-bar" as const;

type ImageWallItemBarProps = {
  fileName: string;
  width: number;
  height: number;
};

const imageWallItemBarSx: SxProps = {
  ...ellipsisSx,
  opacity: 0,
  "& .MuiImageListItemBar-titleWrap": { p: 1.5, pt: 1 },
  "& .MuiImageListItemBar-subtitle": { color: "text.secondary" },
};

const ImageWallItemBar = ({ fileName, width, height }: ImageWallItemBarProps) => (
  <MuiImageListItemBar
    title={fileName}
    subtitle={`${width}px x ${height}px`}
    sx={imageWallItemBarSx}
    className={imageWallItemBarClassName}
  />
);

export { ImageWallItemBar, imageWallItemBarClassName };
