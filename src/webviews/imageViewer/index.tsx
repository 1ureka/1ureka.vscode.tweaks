import { startReactApp } from "@/utils/ui";
import { handleCopy } from "@@/imageViewer/action";
import { ImageViewer } from "@@/imageViewer/ImageViewer";

startReactApp({
  App: ImageViewer,
  beforeRender: () => {
    window.addEventListener("copy", (e) => {
      e.preventDefault();
      handleCopy();
    });
  },
});
