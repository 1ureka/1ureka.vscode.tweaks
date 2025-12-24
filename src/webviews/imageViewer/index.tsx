import { startReactApp } from "@/utils/ui";
import { handleCopy } from "@@/imageViewer/action";
import { ImageViewer, ContextMenu } from "@@/imageViewer/ImageViewer";
import { contextMenuStore } from "@@/imageViewer/store";

const App = () => (
  <>
    <ImageViewer />
    <ContextMenu />
  </>
);

startReactApp({
  App,
  beforeRender: () => {
    window.addEventListener("copy", (e) => {
      e.preventDefault();
      handleCopy();
    });

    window.addEventListener(
      "contextmenu",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        contextMenuStore.setState({ anchorPosition: { top: e.clientY, left: e.clientX } });
      },
      true
    );
  },
});
