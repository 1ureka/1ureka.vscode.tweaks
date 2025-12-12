import { invoke } from "@/utils/message_client";
import { CopyImageAPI, ShowInfoAPI } from "@/providers/imageWallProvider";

const registerClipboardEvent = () => {
  let lastPointerDownImagePath: string | null = null;

  const handlePointerDown = (e: PointerEvent) => {
    const target = e.target;

    if (target instanceof Element && target.classList.contains("image-click-area") && target.id) {
      lastPointerDownImagePath = target.id;
    } else {
      lastPointerDownImagePath = null;
    }
  };

  window.addEventListener("pointerdown", handlePointerDown, true);

  const handleCopy = () => {
    invoke<CopyImageAPI>("copyImage", { filePath: lastPointerDownImagePath });
  };

  window.addEventListener("copy", handleCopy);
  window.addEventListener("cut", handleCopy);
  window.addEventListener("paste", (e) => {
    invoke<ShowInfoAPI>("showInfo", "該編輯器不支援貼上操作");
    e.preventDefault();
  });
};

export { registerClipboardEvent };
