import { readClipboard, writeClipboard } from "@@/fileSystem/action/clipboard";

/**
 * 註冊剪貼簿事件
 */
const registerClipboardEvents = () => {
  window.addEventListener("copy", writeClipboard);
  window.addEventListener("cut", writeClipboard);
  window.addEventListener("paste", readClipboard);
};

export { registerClipboardEvents };
