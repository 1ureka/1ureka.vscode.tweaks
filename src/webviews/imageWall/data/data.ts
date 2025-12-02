import { create } from "zustand";
import { getInitialData, invoke } from "@/utils/message_client";
import type { ImageWallInitialData } from "@/handlers/imageWallHandlers";
import type { ShowInfoAPI, GetPageDataAPI } from "@/providers/imageWallProvider";

const initialData = getInitialData<ImageWallInitialData>();
if (!initialData) {
  invoke<ShowInfoAPI>("showInfo", "無法取得圖片牆初始資料");
  throw new Error("無法取得圖片牆初始資料");
}

const imageWallDataStore = create<ImageWallInitialData>(() => ({ ...initialData }));

const setPage = async (page: number) => {
  const pageData = await invoke<GetPageDataAPI>("getPageData", page);
  imageWallDataStore.setState({ ...pageData });
};

export { imageWallDataStore, setPage };
