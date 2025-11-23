import React, { useEffect, useRef, useState } from "react";
import { Box, Skeleton, type SxProps } from "@mui/material";
import { postMessageToExtension } from "../utils/vscodeApi";
import { imageWallPreferenceStore } from "./imageWallPreference";

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
    postMessageToExtension({ type: "generateImage", id });

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === "imageGenerated" && message.id === id && imgRef.current) {
        // 命令式更新 DOM，避免將 base64 存入 state
        imgRef.current.src = `data:image/webp;base64,${message.base64}`;
        setIsLoaded(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [id]);

  const mode = imageWallPreferenceStore((state) => state.mode);
  const containerSx: SxProps =
    mode === "masonry"
      ? { position: "relative", width: 1, height: "auto", aspectRatio: `${width} / ${height}` }
      : { position: "relative", width: 1, height: 1, minHeight: Math.max(150, Math.floor(Math.min(height, 1080) / 3)) };

  return (
    <Box sx={containerSx}>
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
