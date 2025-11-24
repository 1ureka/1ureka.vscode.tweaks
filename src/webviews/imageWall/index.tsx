import React from "react";
import { createRoot } from "react-dom/client";
import { ImageWall } from "./ImageWall";
import { Providers } from "../utils/Providers";
import { registerClipboardEvent, registerPreferenceEvent } from "./events";

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
  createRoot(container).render(<App />);
}
