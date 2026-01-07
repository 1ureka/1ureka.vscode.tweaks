import { create } from "zustand";
import type { ReadImageResult, ImageViewerAPI } from "@/feature-viewer/provider";
import { createInvoke, getInitialData } from "@/utils/vscode/message/client";

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

/**
 * 建立用於儲存右鍵選單狀態的容器
 */
const contextMenuStore = create<{ anchorPosition: { top: number; left: number } | null }>(() => ({
  anchorPosition: null,
}));

export { dataStore, contextMenuStore, invoke };
