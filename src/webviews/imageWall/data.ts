import { create } from "zustand";
import { postMessageToExtension } from "../utils/vscodeApi";
import type { ImageWallInitialData } from "../../commands/imageWallCommands";

const imageWallDataStore = create<ImageWallInitialData>(() => ({
  folderPath: "",
  folderPathParts: [],
  images: [],
}));

const registerDataChangeEvent = () => {
  postMessageToExtension({ type: "webviewReady" });

  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "imageWallData") {
      const data = event.data as { type: "imageWallData"; data: ImageWallInitialData };
      imageWallDataStore.setState(data.data);
    }
  });
};

export { imageWallDataStore, registerDataChangeEvent };
