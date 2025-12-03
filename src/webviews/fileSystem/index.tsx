import React from "react";
import { createRoot } from "react-dom/client";
import { FileSystem } from "./FileSystem";
import { Providers } from "@/utils/ui";

import { registerInitData } from "./data/data";
import { registerSelectionEvents } from "./data/selection";
import { registerMessageEvents } from "./data/message";
import { registerNavigateShortcuts } from "./data/navigate";

const App = () => {
  return (
    <Providers>
      <FileSystem />
    </Providers>
  );
};

const container = document.getElementById("root");
if (container) {
  registerInitData();
  registerSelectionEvents();
  registerNavigateShortcuts();
  registerMessageEvents();
  createRoot(container).render(<App />);
}

document.body.style.padding = "0";
