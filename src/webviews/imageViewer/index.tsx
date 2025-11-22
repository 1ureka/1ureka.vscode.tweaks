import React from "react";
import { createRoot } from "react-dom/client";
import { ImageViewer } from "./ImageViewer";
import { Providers } from "../utils/Providers";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <Providers>
      <ImageViewer />
    </Providers>
  );
}
