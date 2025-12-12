import React from "react";
import { createRoot } from "react-dom/client";
import { ImageWall } from "./ImageWall";
import { Providers } from "@/utils/ui";

import { registerInitData } from "./data/data";
import { registerCacheClearInterval } from "./data/cache";
import { registerClipboardEvent } from "./data/clipboard";
import { registerPreferenceEvent } from "./data/preference";

const App = () => {
  return (
    <Providers>
      <ImageWall />
    </Providers>
  );
};

const container = document.getElementById("root");
if (container) {
  registerInitData();
  registerClipboardEvent();
  registerPreferenceEvent();
  registerCacheClearInterval({ intervalMs: 60000, maxAgeMs: 300000 }); // 每分鐘清理一次，刪除超過 5 分鐘未使用的快取
  createRoot(container).render(<App />);
}

document.body.style.padding = "0"; // 防止 VsCode 預設讓 Webview 左右有 padding
