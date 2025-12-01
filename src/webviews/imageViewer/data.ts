import type { ImageViewerInitialData } from "@/providers/imageViewerProvider";
import { getInitialData, postMessageToExtension } from "@/utils/message_client";

const imageViewerInitialData = getInitialData<ImageViewerInitialData>();
if (!imageViewerInitialData || !imageViewerInitialData.metadata) {
  postMessageToExtension({ type: "error", error: "圖片載入失敗，無法取得圖片資料" });
}

export { imageViewerInitialData };
