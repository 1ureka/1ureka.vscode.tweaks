import React from "react";
import { createRoot } from "react-dom/client";
import { ImageWall } from "./ImageWall";
import { Providers } from "../utils/Providers";
import { registerClipboardEvent, registerPreferenceEvent } from "./events";
import { registerDataChangeEvent } from "./data";

const App = () => {
  return (
    <Providers>
      <ImageWall />
    </Providers>
  );
};

const container = document.getElementById("root");
if (container) {
  registerClipboardEvent();
  registerPreferenceEvent();
  registerDataChangeEvent();
  createRoot(container).render(<App />);
}

document.body.style.padding = "0"; // 防止 VsCode 預設讓 Webview 左右有 padding
