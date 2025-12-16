import { startReactApp } from "@/utils/ui";
import { ImageViewer } from "./ImageViewer";
import { registerMessageEvents } from "./data/events";

startReactApp({
  App: ImageViewer,
  beforeRender: () => {
    registerMessageEvents();
  },
});
