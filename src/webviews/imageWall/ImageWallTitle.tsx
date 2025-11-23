import React, { useState } from "react";
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import { imageWallPreferenceStore, setImageWallPreference } from "./imageWallPreference";
import type { ImageWallPreferenceState } from "./imageWallPreference";

const layoutOptions: ImageWallPreferenceState["mode"][] = ["standard", "woven", "masonry"];
const layoutTranslations: Record<ImageWallPreferenceState["mode"], string> = {
  standard: "標準",
  woven: "編織",
  masonry: "磚牆",
};

const ModeSelect = ({ disabled }: { disabled: boolean }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const mode = imageWallPreferenceStore((state) => state.mode);

  const handleModeChange = (newMode: typeof mode) => {
    setImageWallPreference({ mode: newMode });
    handleClose();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        布局
      </Typography>
      <Button
        variant="contained"
        disableElevation
        onClick={handleClick}
        disabled={disabled}
        startIcon={<span className="codicon codicon-layout"></span>}
        endIcon={<span className="codicon codicon-chevron-down"></span>}
      >
        {layoutTranslations[mode]}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {layoutOptions.map((key) => (
          <MenuItem key={key} selected={mode === key} onClick={() => handleModeChange(key)}>
            {layoutTranslations[key]}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

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
    </Box>
  </Box>
);

export { ImageWallTitle };
