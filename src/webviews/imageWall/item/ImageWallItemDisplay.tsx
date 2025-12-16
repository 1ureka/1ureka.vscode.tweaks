import { useEffect, useRef } from "react";
import { Box, Skeleton, type SxProps } from "@mui/material";
import { useImageCache, imageWallIntersectionObserver } from "../data/cache";

type ImageDisplayProps = {
  filePath: string;
  fileName: string;
  width: number;
  height: number;
};

const containerBaseSx: SxProps = {
  position: "relative",
  width: 1,
  height: "auto",
  minHeight: "100%",
};

const ImageWallItemDisplay = ({ filePath, fileName, width, height }: ImageDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;

    if (element) {
      imageWallIntersectionObserver.observe(element);
      return () => {
        imageWallIntersectionObserver.unobserve(element);
      };
    }
  }, []);

  const cache = useImageCache(filePath);

  return (
    <Box id={filePath} ref={containerRef} sx={{ ...containerBaseSx, aspectRatio: `${width} / ${height}` }}>
      <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />

      {cache?.status === "loaded" && (
        <img
          alt={fileName}
          src={"data:image/webp;base64," + cache.data}
          loading="lazy"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}

      {cache?.status === "error" && (
        <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <i className="codicon codicon-warning" style={{ fontSize: 32, color: "var(--vscode-errorForeground)" }} />
        </Box>
      )}
    </Box>
  );
};

export { ImageWallItemDisplay };
