import type { ImageViewerInitialData, ShowErrorAPI } from "@/providers/imageViewerProvider";
import { getInitialData, invoke } from "@/utils/message_client";

const imageViewerInitialData = getInitialData<ImageViewerInitialData>();
if (!imageViewerInitialData || !imageViewerInitialData.metadata) {
  invoke<ShowErrorAPI>("showError", "圖片載入失敗，無法取得圖片資料");
}

export { imageViewerInitialData };
