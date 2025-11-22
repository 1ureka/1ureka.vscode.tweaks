import React from "react";
import { Box, Typography } from "@mui/material";

const ImageWallTitle = ({ folderPath, imageCount }: { folderPath: string; imageCount: number }) => (
  <Box sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: "divider" }}>
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
);

export { ImageWallTitle };
