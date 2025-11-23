import React from "react";
import { Box, Typography } from "@mui/material";
import { ModeSelect, SizeSelect } from "./ImageWallControl";

const ImageWallTitle = ({ folderPath, imageCount }: { folderPath: string; imageCount: number }) => (
  <Box sx={{ mb: 3, pb: 2, display: "flex", gap: 2, justifyContent: "space-between" }}>
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        圖片牆
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-all" }}>
        {folderPath}
      </Typography>
      {imageCount > 0 && (
        <Typography variant="body2" color="text.secondary">
          共 {imageCount} 張圖片
        </Typography>
      )}
    </Box>

    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <ModeSelect disabled={imageCount === 0} />
      <SizeSelect disabled={imageCount === 0} />
    </Box>
  </Box>
);

export { ImageWallTitle };
