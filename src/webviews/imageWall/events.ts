import { create } from "zustand";
import { postMessageToExtension } from "../utils/vscodeApi";

const selectedImageIdStore = create<{ id: string | null }>(() => ({ id: null }));
const setSelectedImageId = (id: string | null) => {
  selectedImageIdStore.setState({ id });
};

const handleCopy = (e: ClipboardEvent) => {
  const { id } = selectedImageIdStore.getState();
  if (!id) {
    postMessageToExtension({ type: "info", info: "目前沒有選取任何圖片" });
    return;
  }
  postMessageToExtension({ type: "copyImage", id });
  e.preventDefault();
};

const registerClipboardEvent = () => {
  window.addEventListener("copy", handleCopy);
  window.addEventListener("cut", handleCopy);
  window.addEventListener("paste", (e) => {
    postMessageToExtension({ type: "info", info: "該編輯器不支援貼上操作" });
    e.preventDefault();
  });
};

export { registerClipboardEvent, selectedImageIdStore, setSelectedImageId };
