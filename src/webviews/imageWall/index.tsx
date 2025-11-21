import React from "react";
import { createRoot } from "react-dom/client";
import { ImageWall } from "./ImageWall";
import { Providers } from "../utils/Providers";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <Providers>
      <ImageWall />
    </Providers>
  );
}
