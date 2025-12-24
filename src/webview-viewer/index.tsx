import { startReactApp } from "@/utils/ui";
import { handleCopy } from "@viewer/action";
import { ImageViewer, ContextMenu } from "@viewer/ImageViewer";
import { contextMenuStore } from "@viewer/store";

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
