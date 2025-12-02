import React, { useEffect, useRef, useState } from "react";
import { Box, Skeleton } from "@mui/material";
import type { GenerateThumbnailAPI } from "@/providers/imageWallProvider";
import { invoke } from "@/utils/message_client";

type ImageDisplayProps = {
  id: string;
  fileName: string;
  width: number;
  height: number;
};

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ id, fileName, width, height }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    invoke<GenerateThumbnailAPI>("generateThumbnail", id).then((base64) => {
      if (base64 && imgRef.current) {
        // 命令式更新 DOM，避免將 base64 存入 state
        imgRef.current.src = `data:image/webp;base64,${base64}`;
        setIsLoaded(true);
      }
    });
  }, [id]);

  return (
    <Box
      sx={{
        position: "relative",
        width: 1,
        height: "auto",
        aspectRatio: `${width} / ${height}`,
        minHeight: "100%",
      }}
    >
      <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
      <img
        ref={imgRef}
        alt={fileName}
        loading="lazy"
        style={{
          position: "absolute",
          inset: 0,
          display: isLoaded ? "block" : "none",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </Box>
  );
};
