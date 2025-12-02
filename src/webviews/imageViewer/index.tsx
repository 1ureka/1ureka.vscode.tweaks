import React from "react";
import { createRoot } from "react-dom/client";
import { ImageViewer } from "./ImageViewer";
import { Providers } from "@/utils/ui";
import { registerMessageEvents } from "./data/events";

const App = () => {
  return (
    <Providers>
      <ImageViewer />
    </Providers>
  );
};

const container = document.getElementById("root");
if (container) {
  registerMessageEvents();
  createRoot(container).render(<App />);
}

document.body.style.padding = "0"; // 防止 VsCode 預設讓 Webview 左右有 padding
