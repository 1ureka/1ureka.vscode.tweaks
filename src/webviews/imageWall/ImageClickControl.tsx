import React from "react";
import { ButtonBase } from "@mui/material";
import { postMessageToExtension } from "../utils/vscodeApi";

const ImageClickControl = ({ filePath }: { filePath: string }) => {
  return (
    <ButtonBase
      sx={{ position: "absolute", inset: 0, zIndex: 1 }}
      onClick={() => {
        postMessageToExtension({ type: "imageClick", filePath });
      }}
    />
  );
};

export { ImageClickControl };
