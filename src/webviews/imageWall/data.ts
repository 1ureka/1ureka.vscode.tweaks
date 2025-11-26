import { create } from "zustand";
import { postMessageToExtension, getInitialData } from "../utils/vscodeApi";
import type { ImageWallPageData, ImageWallInitialData } from "../../handlers/imageWallHandlers";

const initialData = getInitialData<ImageWallInitialData>();
if (!initialData) {
  postMessageToExtension({ type: "info", message: "無法取得圖片牆初始資料" });
  throw new Error("無法取得圖片牆初始資料");
}

const imageWallDataStore = create<ImageWallInitialData>(() => ({ ...initialData }));

const setPage = (page: number) => {
  postMessageToExtension({ type: "images", page });
};

const registerDataChangeEvent = () => {
  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "imageWallData") {
      const { data } = event.data as { type: "imageWallData"; data: ImageWallPageData };
      imageWallDataStore.setState(data);
    }
  });
};

export { imageWallDataStore, registerDataChangeEvent, setPage };
