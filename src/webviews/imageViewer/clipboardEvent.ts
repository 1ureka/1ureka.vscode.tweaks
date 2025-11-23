import { postMessageToExtension } from "../utils/vscodeApi";
import type { ExtendedMetadata } from "../../utils/imageOpener";

const registerClipboardEvent = (metadata: ExtendedMetadata) => {
  const handleCopy = (e: ClipboardEvent) => {
    const filePath = metadata?.filePath;
    if (!filePath) return;
    if (!e.clipboardData) return;

    e.clipboardData.setData("text/plain", filePath);
    e.preventDefault();
    postMessageToExtension({ type: "info", info: `已複製圖片路徑: ${filePath}` });
  };

  window.addEventListener("copy", handleCopy);
  window.addEventListener("cut", handleCopy);
  window.addEventListener("paste", (e) => {
    postMessageToExtension({ type: "info", info: "該編輯器不支援貼上操作" });
    e.preventDefault();
  });
};

export { registerClipboardEvent };
