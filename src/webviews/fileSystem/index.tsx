import React from "react";
import { createRoot } from "react-dom/client";
import { FileSystem } from "./FileSystem";
import { Providers } from "@/utils/ui";
import { registerMessageEvents } from "./data/data";

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
  createRoot(container).render(<App />);
}

document.body.style.padding = "0";
