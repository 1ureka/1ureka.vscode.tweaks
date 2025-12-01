import React from "react";
import { createRoot } from "react-dom/client";
import { FileSystem } from "./FileSystem";
import { Providers } from "../utils/Providers";
import { registerDataInitEvent } from "./data/data";

const App = () => {
  return (
    <Providers>
      <FileSystem />
    </Providers>
  );
};

const container = document.getElementById("root");
if (container) {
  registerDataInitEvent();
  createRoot(container).render(<App />);
}

document.body.style.padding = "0";
