import React from "react";
import { ButtonBase } from "@mui/material";
import { invoke } from "@/utils/message_client";
import type { ClickImageAPI } from "@/providers/imageWallProvider";

const ImageWallItemButton = ({ filePath }: { filePath: string }) => (
  <ButtonBase
    id={filePath}
    className="image-click-area"
    focusRipple
    sx={{ position: "absolute", inset: 0, zIndex: 1 }}
    onClick={() => invoke<ClickImageAPI>("clickImage", { filePath })}
  />
);

export { ImageWallItemButton };
