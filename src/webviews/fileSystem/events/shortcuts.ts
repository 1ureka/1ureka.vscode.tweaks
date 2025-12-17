import { refresh } from "@@/fileSystem/action/navigation";
import { selectAll, selectInvert, selectNone, toggleBoxSelectionMode } from "@@/fileSystem/action/selection";
import { fileSystemBoxSelectionStore } from "@@/fileSystem/store/other";

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

      // Crtl + G 或 Cmd + G：前往指定目錄
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

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        e.stopPropagation();
        toggleBoxSelectionMode();
      }

      const { isBoxSelecting } = fileSystemBoxSelectionStore.getState();

      if (e.key === "Escape" && isBoxSelecting) {
        e.preventDefault();
        e.stopPropagation();
        toggleBoxSelectionMode(false);
      }
    },
    true
  );
};

export { registerNavigateShortcuts, registerSelectionShortcuts };
