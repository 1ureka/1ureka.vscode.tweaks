import React, { useEffect, useRef, useState } from "react";
import { Box, Skeleton } from "@mui/material";
import { postMessageToExtension } from "../utils/vscodeApi";

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
    postMessageToExtension({ type: "generateThumbnail", id });

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === "thumbnailGenerated" && message.id === id && imgRef.current) {
        // 命令式更新 DOM，避免將 base64 存入 state
        imgRef.current.src = `data:image/webp;base64,${message.base64}`;
        setIsLoaded(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
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
