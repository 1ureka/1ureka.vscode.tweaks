import type { ImageMetadata } from "@/utils/host/image";
import type { InspectDirectoryEntry } from "@/utils/host/system";
import type { OneOf, Prettify } from "@/utils/shared/type";

/**
 * 檔案系統延伸主機以資料夾模式讀取下，每個條目的元資料型別
 */
type FileMetadata = Prettify<InspectDirectoryEntry & { defaultSelected?: boolean }>;

/**
 * 延伸主機讀取結果必定包含的基礎資料型別
 */
type ReadBase = {
  // 有關當前目錄的資訊
  currentPath: string;
  shortenedPath: string;
  currentPathParts: string[];
  isCurrentRoot: boolean;
  fileCount: number;
  folderCount: number;
  // 最後更新的時間戳記
  timestamp: number;
};

/**
 * 當 mode 為 "directory" 時，延伸主機讀取結果的型別
 */
type ReadDirectoryResult = Prettify<
  ReadBase & {
    mode: "directory";
    entries: FileMetadata[];
    imageEntries: never[];
  }
>;

/**
 * 當 mode 為 "images" 時，延伸主機讀取結果的型別
 */
type ReadImagesResult = Prettify<
  ReadBase & {
    mode: "images";
    entries: never[];
    imageEntries: ImageMetadata[];
  }
>;

/**
 * 延伸主機讀取後的統一回傳型別
 *
 * 實際的回傳資料，根據請求的 mode 會有不同的內容，但必定保證有一個會是空陣列
 */
type ReadResourceResult = OneOf<[ReadDirectoryResult, ReadImagesResult]>;

/**
 * 讀取目錄內容的參數型別
 */
type ReadDirectoryParams = {
  dirPath: string;
  depthOffset?: number;
  selectedPaths?: string[]; // 預設選取的路徑
};

export type { ReadDirectoryParams, ReadResourceResult, FileMetadata };
