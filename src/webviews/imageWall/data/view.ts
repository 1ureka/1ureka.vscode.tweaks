import { create } from "zustand";
import type { ImageMetadata } from "@/utils/image";
import { imageWallDataStore } from "@@/imageWall/data/data";

type ImageWallViewState = {
  page: number;
  pageSize: number;
  totalPages: number;
  _t: number; // 用於確保依賴鏈按照順序執行
};

type ImageWallViewData = {
  images: ImageMetadata[];
};

const defaultViewState: ImageWallViewState = {
  page: 1,
  pageSize: 50,
  totalPages: 1,
  _t: Date.now(),
};

/**
 * 圖片牆檢視狀態管理 (如何檢視)
 */
const imageWallViewState = create<ImageWallViewState>(() => ({ ...defaultViewState }));

/**
 * 圖片牆檢視資料管理 `f(data, viewState) => viewData`
 */
const imageWallViewData = create<ImageWallViewData>(() => ({ images: [] }));

/** 依賴鏈1: 當 data 改變時，驗證分頁 */
imageWallDataStore.subscribe((state) => {
  const imageData = state.images;

  if (imageData.length === 0) {
    imageWallViewState.setState({ ...defaultViewState });
    return;
  }

  const prevViewState = imageWallViewState.getState();

  const totalPages = Math.max(1, Math.ceil(imageData.length / prevViewState.pageSize));
  const page = Math.min(prevViewState.page, totalPages);

  imageWallViewState.setState({ page, totalPages, _t: Date.now() });
});

/** 依賴鏈2: 無論是 data 或 viewState 改變時，更新 viewData */
imageWallViewState.subscribe((state) => {
  const imageData = imageWallDataStore.getState().images;

  if (imageData.length === 0) {
    return;
  }

  const startIndex = (state.page - 1) * state.pageSize;
  const endIndex = startIndex + state.pageSize;

  const pagedImages = imageData.slice(startIndex, endIndex);

  imageWallViewData.setState({ images: pagedImages });
});

/** 設定頁碼 */
const setPage = (newPage: number) => {
  imageWallViewState.setState((state) => ({
    page: Math.min(Math.max(1, newPage), state.totalPages),
  }));
};

export { imageWallViewState, imageWallViewData, setPage };
