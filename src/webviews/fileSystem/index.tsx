import React from "react";
import { createRoot } from "react-dom/client";
import { FileSystem } from "./FileSystem";
import { Providers } from "@/utils/ui";
import { registerMessageEvents } from "./data/data";
import { registerSelectionEvents } from "./data/selection";

const App = () => {
  return (
    <Providers>
      <FileSystem />
    </Providers>
  );
};

const container = document.getElementById("root");
if (container) {
  registerMessageEvents();
  registerSelectionEvents();
  createRoot(container).render(<App />);
}

document.body.style.padding = "0";
