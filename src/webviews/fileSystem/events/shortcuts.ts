import { refresh } from "@@/fileSystem/action/navigation";
import { selectAll, selectInvert, selectNone } from "@@/fileSystem/action/selection";
import { actionInputClassName } from "@@/fileSystem/components/Action";

/**
 * 註冊有關導航的快捷鍵
 */
const registerNavigateShortcuts = () => {
  window.addEventListener(
    "keydown",
    (e) => {
      // Ctrl + R 或 Cmd + R：重新整理
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") {
        e.preventDefault();
        e.stopPropagation();
        refresh();
      }

      // Ctrl + G 或 Cmd + G：前往指定目錄
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "g") {
        e.preventDefault();
        e.stopPropagation();
        // TODO
      }
    },
    true
  );
};

/**
 * 註冊有關選取的快捷鍵
 */
const registerSelectionShortcuts = () => {
  window.addEventListener(
    "keydown",
    (e) => {
      const target = e.target as HTMLElement;
      if (target.closest(`.${actionInputClassName}`)) return; // 在輸入框中不觸發快捷鍵

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) selectNone();
        else selectAll();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        selectInvert();
      }
    },
    true
  );
};

export { registerNavigateShortcuts, registerSelectionShortcuts };
