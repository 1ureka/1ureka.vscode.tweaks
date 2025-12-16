import { startReactApp } from "@/utils/ui";
import { ImageWall } from "./ImageWall";
import { registerInitData } from "./data/data";
import { registerCacheClearInterval } from "./data/cache";
import { registerClipboardEvent } from "./data/clipboard";
import { registerPreferenceEvent } from "./data/preference";

startReactApp({
  App: ImageWall,
  beforeRender: () => {
    registerInitData();
    registerClipboardEvent();
    registerPreferenceEvent();
    registerCacheClearInterval({ intervalMs: 60000, maxAgeMs: 300000 }); // 每分鐘清理一次，刪除超過 5 分鐘未使用的快取
  },
});
