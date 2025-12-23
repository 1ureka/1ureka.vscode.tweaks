import { create } from "zustand";
import type { ReadImageResult, ImageViewerAPI } from "@/providers/imageViewerProvider";
import { createInvoke, getInitialData } from "@/utils/message_client";

/**
 * 建立用於調用延伸主機 API 的函式
 */
const { invoke } = createInvoke<ImageViewerAPI>();

const initialData = getInitialData<ReadImageResult>();
if (!initialData || !initialData.metadata) {
  invoke("show.error", "圖片載入失敗，無法取得圖片資料");
  throw new Error("圖片載入失敗，無法取得圖片資料");
}

/**
 * 建立前端用於儲存圖片檢視器資料的容器
 */
const dataStore = create<ReadImageResult>(() => ({ ...initialData }));

export { dataStore, invoke };
