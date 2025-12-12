import { create } from "zustand";
import { getInitialData, invoke } from "@/utils/message_client";
import type { ImageWallInitialData } from "@/handlers/imageWallHandlers";
import type { ShowErrorAPI, GenerateMetadataAPI } from "@/providers/imageWallProvider";

const initialData = getInitialData<ImageWallInitialData>();
if (!initialData) {
  invoke<ShowErrorAPI>("showError", "無法取得圖片牆初始資料");
  throw new Error("無法取得圖片牆初始資料");
}

const imageWallDataStore = create<ImageWallInitialData & { initialLoading: boolean }>(() => ({
  ...initialData,
  initialLoading: true,
}));

const registerInitData = async () => {
  const result = await invoke<GenerateMetadataAPI>("generateMetadata", undefined);
  imageWallDataStore.setState({ images: result, initialLoading: false });
};

export { imageWallDataStore, registerInitData };
