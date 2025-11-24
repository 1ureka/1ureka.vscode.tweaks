import { create } from "zustand";
import { postMessageToExtension } from "../utils/vscodeApi";

type ImageWallPreferenceState = {
  mode: "standard" | "woven" | "masonry";
  columnSize: "s" | "m" | "l";
};

const imageWallPreferenceStore = create<ImageWallPreferenceState>(() => ({
  mode: "masonry",
  columnSize: "m",
}));

const setImageWallPreference = (preference: Partial<ImageWallPreferenceState>) => {
  imageWallPreferenceStore.setState((state) => ({ ...state, ...preference }));
};

type PreferenceMessage = {
  type: "setPreference";
  preference: {
    mode?: "standard" | "woven" | "masonry"; // 布局模式
    size?: "s" | "m" | "l"; // 尺寸
  };
};

const registerPreferenceEvent = () => {
  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "setPreference") {
      const { preference } = event.data as PreferenceMessage;
      if (preference.mode) {
        setImageWallPreference({ mode: preference.mode });
      }
      if (preference.size) {
        setImageWallPreference({ columnSize: preference.size });
      }
    }
  });
};

const registerClipboardEvent = () => {
  let lastPointerDownImageId: string | null = null;

  const handlePointerDown = (e: PointerEvent) => {
    const target = e.target;

    if (target instanceof Element && target.classList.contains("image-click-area") && target.id) {
      lastPointerDownImageId = target.id;
    } else {
      lastPointerDownImageId = null;
    }
  };

  window.addEventListener("pointerdown", handlePointerDown, true);

  const handleCopy = () => {
    if (lastPointerDownImageId) {
      postMessageToExtension({ type: "copyImage", id: lastPointerDownImageId });
    }
  };

  window.addEventListener("copy", handleCopy);
  window.addEventListener("cut", handleCopy);
  window.addEventListener("paste", (e) => {
    postMessageToExtension({ type: "info", info: "該編輯器不支援貼上操作" });
    e.preventDefault();
  });
};

export { registerClipboardEvent, registerPreferenceEvent, imageWallPreferenceStore };
