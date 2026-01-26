import { appStateStore } from "@explorer/store/data";
import { tableClass } from "@explorer/layout-table/config";
import { tableRowIndexAttr } from "@explorer/layout-table/TableRow";

/**
 * 根據事件獲取對應的資料列索引
 */
const getIndexFromEvent = (e: PointerEvent) => {
  const target = e.target as HTMLElement;

  const indexStr = target.closest(`.${tableClass.row}`)?.getAttribute(tableRowIndexAttr);
  if (indexStr === undefined) return null;

  const index = Number(indexStr);
  if (isNaN(index)) return null;

  return index;
};

/**
 * ?
 */
const registerContextMenu = () => {
  const handleContextMenu = (e: PointerEvent) => {
    if (window.getSelection()?.type === "Range") return; // 有文字選取時不觸發右鍵選單

    e.preventDefault();
    e.stopPropagation();
    if (!e.target) return;

    appStateStore.setState({ contextMenuAnchor: { x: e.clientX, y: e.clientY } });
    const index = getIndexFromEvent(e);

    if (index === null) {
      // TODO: 決定不在 row 上右鍵時 context menu 的內容
      return;
    }

    // TODO: 根據 index 決定 context menu 的內容
  };

  window.addEventListener("contextmenu", handleContextMenu, true);
};

/**
 * 關閉右鍵選單
 */
const closeContextMenu = () => {
  appStateStore.setState({ contextMenuAnchor: null });
};

export { registerContextMenu, closeContextMenu };
