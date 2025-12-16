import { startReactApp } from "@/utils/ui";
import { registerCacheClearInterval } from "@@/imageWall/data/cache";
import { registerClipboardEvent } from "@@/imageWall/data/clipboard";
import { registerInitData } from "@@/imageWall/data/data";
import { registerPreferenceEvent } from "@@/imageWall/data/preference";
import { ImageWall } from "@@/imageWall/ImageWall";

startReactApp({
  App: ImageWall,
  beforeRender: () => {
    registerInitData();
    registerClipboardEvent();
    registerPreferenceEvent();
    registerCacheClearInterval({ intervalMs: 60000, maxAgeMs: 300000 }); // 每分鐘清理一次，刪除超過 5 分鐘未使用的快取
  },
});
