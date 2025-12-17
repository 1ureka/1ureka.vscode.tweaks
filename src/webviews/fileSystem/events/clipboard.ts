import { invokeClipboardPaste, setClipboard } from "@@/fileSystem/action/clipboard";

/**
 * 註冊剪貼簿事件
 */
const registerClipboardEvents = () => {
  window.addEventListener("copy", setClipboard);
  window.addEventListener("cut", setClipboard);
  window.addEventListener("paste", invokeClipboardPaste);
};

export { registerClipboardEvents };
