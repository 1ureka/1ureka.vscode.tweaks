import React from "react";
import { createRoot } from "react-dom/client";
import { ImageViewer } from "./ImageViewer";
import { Providers } from "../utils/Providers";
import { registerClipboardEvent } from "./events";
import { useEyeDropper } from "./hooks";

const App = () => {
  useEyeDropper();
  return (
    <Providers>
      <ImageViewer />
    </Providers>
  );
};

const container = document.getElementById("root");
if (container) {
  registerClipboardEvent();
  createRoot(container).render(<App />);
}

document.body.style.padding = "0"; // 防止 VsCode 預設讓 Webview 左右有 padding
