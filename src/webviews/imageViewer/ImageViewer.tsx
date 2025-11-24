import React, { useEffect, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { imageViewerInitialData } from "./data";

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

const ImageDisplay = ({ src, alt }: { src: string; alt: string }) => {
  const [cursor, setCursor] = useState("grab");

  const handlePanStart = () => setCursor("grabbing");
  const handlePanStop = () => setCursor("grab");

  return (
    <TransformWrapper centerOnInit onPanningStart={handlePanStart} onPanningStop={handlePanStop}>
      {({ resetTransform, ...rest }) => (
        <>
          <TransformComponent wrapperStyle={{ width: "100%", height: "100dvh" }} contentStyle={{ cursor }}>
            <img src={src} alt={alt} style={{ display: "block", maxWidth: "100%", maxHeight: "100vh" }} />
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
    return <ImageDisplay src={data.uri} alt={data.metadata.fileName} />;
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
