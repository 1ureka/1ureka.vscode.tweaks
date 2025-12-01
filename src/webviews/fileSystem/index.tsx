import React from "react";
import { createRoot } from "react-dom/client";
import { FileSystem } from "./FileSystem";
import { Providers } from "@/utils/ui";
import { registerDataInitEvent } from "./data/data";
import { registerContextCommandEvents } from "./data/message";

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
  registerContextCommandEvents();
  createRoot(container).render(<App />);
}

document.body.style.padding = "0";
