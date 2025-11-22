import React, { useEffect, useState } from "react";
import { getInitialData, postMessageToExtension } from "../utils/vscodeApi";
import { Box, Container, Typography } from "@mui/material";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";

const useEyeDropper = () => {
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const message = event.data;
      if (message.type !== "eyeDropper") return;

      const eyeDropper = new EyeDropper();
      try {
        const result = await eyeDropper.open();
        postMessageToExtension({ type: "eyeDropper", color: result.sRGBHex });
      } catch (error) {
        postMessageToExtension({ type: "error", error: "顏色選取失敗" });
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);
};

interface ImageViewerData {
  imageUri: string;
  fileName: string;
  fileExt: string;
  filePath: string;
}

const data = getInitialData<ImageViewerData>();
if (!data) {
  postMessageToExtension({ type: "error", error: "圖片載入失敗，無法取得圖片資料" });
}

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

const ImageDisplay = ({ data }: { data: ImageViewerData }) => {
  const [cursor, setCursor] = useState("grab");
  useEyeDropper();

  return (
    <TransformWrapper centerOnInit onPanningStart={() => setCursor("grabbing")} onPanningStop={() => setCursor("grab")}>
      {({ resetTransform, ...rest }) => (
        <>
          <TransformComponent wrapperStyle={{ width: "100%", height: "100dvh" }} contentStyle={{ cursor }}>
            <img
              src={data.imageUri}
              alt={data.fileName}
              style={{ display: "block", maxWidth: "100%", maxHeight: "100vh" }}
            />
          </TransformComponent>
          <Controls />
        </>
      )}
    </TransformWrapper>
  );
};

export const ImageViewer: React.FC = () => {
  if (!data) {
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
  }

  return <ImageDisplay data={data} />;
};
