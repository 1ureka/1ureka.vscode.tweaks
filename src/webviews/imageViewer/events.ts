import { postMessageToExtension } from "@/utils/message_client";

const registerClipboardEvent = () => {
  const handleCopy = (e: ClipboardEvent) => {
    postMessageToExtension({ type: "copy" });
    e.preventDefault();
  };

  window.addEventListener("copy", handleCopy);
  window.addEventListener("cut", handleCopy);
  window.addEventListener("paste", (e) => {
    postMessageToExtension({ type: "info", info: "該編輯器不支援貼上操作" });
    e.preventDefault();
  });
};

export { registerClipboardEvent };
