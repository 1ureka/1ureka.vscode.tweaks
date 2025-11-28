import React, { useEffect, useState } from "react";
import { Box, Container, Skeleton, Typography } from "@mui/material";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { imageViewerInitialData } from "./data";
import { useDecodeImage } from "./hooks";

const Controls = () => {
  const { resetTransform } = useControls();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === "resetTransform") resetTransform();
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [resetTransform]);

  return null;
};

/**
 * 計算圖片在容器中以「包含」方式顯示的寬高，實際效果類似 CSS 的 `object-fit: contain`
 */
function getContainLayout(imageWidth: number, imageHeight: number, gutterWidth = 32) {
  const containerRatio = window.innerWidth / window.innerHeight;
  const imageRatio = imageWidth / imageHeight;

  let width, height;
  if (containerRatio > imageRatio) {
    height = window.innerHeight - gutterWidth; // padding
    width = height * imageRatio;
  } else {
    width = window.innerWidth - gutterWidth;
    height = width / imageRatio;
  }

  return { width, height };
}

type ImageDisplayProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

const ImageDisplay = ({ src: initialSrc, alt, width, height }: ImageDisplayProps) => {
  const [cursor, setCursor] = useState("grab");
  const [src, loaded] = useDecodeImage(initialSrc);

  const handlePanStart = () => setCursor("grabbing");
  const handlePanStop = () => setCursor("grab");

  return (
    <TransformWrapper centerOnInit onPanningStart={handlePanStart} onPanningStop={handlePanStop}>
      {({ resetTransform, ...rest }) => (
        <>
          <TransformComponent wrapperStyle={{ width: "100%", height: "100dvh" }} contentStyle={{ cursor }}>
            {loaded && src ? (
              <img src={src} alt={alt} style={{ display: "block", ...getContainLayout(width, height) }} />
            ) : (
              <Skeleton variant="rectangular" animation="wave" sx={getContainLayout(width, height)} />
            )}
          </TransformComponent>
          <Controls />
        </>
      )}
    </TransformWrapper>
  );
};

export const ImageViewer: React.FC = () => {
  const data = imageViewerInitialData;

  if (data && data.metadata) {
    const { fileName, width, height } = data.metadata;
    return <ImageDisplay src={data.uri} alt={fileName} width={width} height={height} />;
  }

  return (
    <Container maxWidth="md" sx={{ display: "grid", height: 1, placeItems: "center" }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h5" color="error" gutterBottom>
          載入失敗：無法取得圖片資料
        </Typography>
        <Typography variant="body1">請確認圖片檔案是否存在，或重新開啟圖片檢視器。</Typography>
      </Box>
    </Container>
  );
};
