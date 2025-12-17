import { startReactApp } from "@/utils/ui";
import { registerMessageEvents } from "@@/imageViewer/data/events";
import { ImageViewer } from "@@/imageViewer/ImageViewer";

startReactApp({
  App: ImageViewer,
  beforeRender: () => {
    registerMessageEvents();
  },
});
