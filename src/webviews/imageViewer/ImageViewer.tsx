import React, { useState } from "react";
import { getInitialData } from "../utils/vscodeApi";
import { Box, Container, Typography } from "@mui/material";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface ImageViewerData {
  imageUri: string;
  fileName: string;
  fileExt: string;
  filePath: string;
}

export const ImageViewer: React.FC = () => {
  const data = getInitialData<ImageViewerData>();
  const [cursor, setCursor] = useState("grab");

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

  return (
    <TransformWrapper centerOnInit onPanningStart={() => setCursor("grabbing")} onPanningStop={() => setCursor("grab")}>
      {({ resetTransform, ...rest }) => (
        <TransformComponent wrapperStyle={{ width: "100%", height: "100dvh" }} contentStyle={{ cursor }}>
          <img
            src={data.imageUri}
            alt={data.fileName}
            style={{ display: "block", maxWidth: "100%", maxHeight: "100vh" }}
            onContextMenu={() => resetTransform()}
          />
        </TransformComponent>
      )}
    </TransformWrapper>
  );
};
