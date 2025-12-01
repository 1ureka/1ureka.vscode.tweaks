import React from "react";
import { ButtonBase } from "@mui/material";
import { postMessageToExtension } from "@/utils/message_client";

const ImageClickControl = ({ id }: { id: string }) => {
  return (
    <ButtonBase
      id={id}
      className="image-click-area"
      focusRipple
      sx={{ position: "absolute", inset: 0, zIndex: 1 }}
      onClick={() => {
        postMessageToExtension({ type: "clickImage", id });
      }}
    />
  );
};

export { ImageClickControl };
