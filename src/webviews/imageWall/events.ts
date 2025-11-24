import { postMessageToExtension } from "../utils/vscodeApi";

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

export { registerClipboardEvent };
