import { create } from "zustand";
import { postMessageToExtension, getInitialData } from "../utils/vscodeApi";
import type { ImageWallData, ImageWallInitialData } from "../../commands/imageWallCommands";

const initialData = getInitialData<ImageWallInitialData>();
if (!initialData) {
  postMessageToExtension({ type: "info", message: "無法取得圖片牆初始資料" });
  throw new Error("無法取得圖片牆初始資料");
}

const imageWallDataStore = create<ImageWallData>(() => ({
  ...initialData,
  images: [],
}));

const registerDataChangeEvent = () => {
  postMessageToExtension({ type: "ready" });

  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "imageWallData") {
      const data = event.data as { type: "imageWallData"; data: ImageWallData };
      imageWallDataStore.setState(data.data);
    }
  });
};

export { imageWallDataStore, registerDataChangeEvent };
