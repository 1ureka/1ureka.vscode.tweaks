import { Box } from "@mui/material";
import { ActionButton, ActionGroup, ActionInput } from "@@/fileSystem/components/Action";
import { ActionDropdown, ActionDropdownButton } from "@@/fileSystem/components/Action";
import { clipboardStore, renameStore, selectionStore, viewDataStore } from "@@/fileSystem/store/data";

import { deleteItems, renameItem, renameItemTemp } from "@@/fileSystem/action/operation";
import { readClipboard, writeClipboard, writeSystemClipboard } from "@@/fileSystem/action/clipboard";
import { selectAll, selectInvert, selectNone } from "@@/fileSystem/action/selection";

const ActionBar = () => {
  const rows = viewDataStore((state) => state.entries);
  const lastSelectedIndex = selectionStore((state) => state.lastSelectedIndex);
  const destName = renameStore((state) => state.destName);
  const selected = selectionStore((state) => state.selected);
  const clipboardEntries = clipboardStore((state) => state.entries);

  const viewMode = viewDataStore((state) => state.viewMode);
  if (viewMode !== "directory") {
    return null;
  }

  const selectionCount = selected.filter((v) => v).length;
  const clipboardCount = Object.keys(clipboardEntries).length;

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto 0.35fr 0.3fr", gap: 1, pt: 1 }}>
      <ActionGroup>
        <ActionInput
          actionName="重新命名"
          actionDetail="重新命名最後選取的項目"
          value={destName}
          onChange={renameItemTemp}
        />
        <ActionButton
          actionIcon="codicon codicon-rename"
          actionName="重新命名"
          actionDetail="重新命名最後選取的項目"
          disabled={destName === "" || lastSelectedIndex === null}
          onClick={renameItem}
        />
        <ActionDropdown actionName="更多操作" actionDetail="更多對於最後選取項目的操作" menuPlacement="top">
          <ActionDropdownButton
            actionIcon="codicon codicon-copy"
            actionName="複製項目名稱"
            actionDetail="複製該檔案或資料夾的名稱到系統剪貼簿"
            disabled={lastSelectedIndex === null}
            onClick={() => writeSystemClipboard("name")}
          />
          <ActionDropdownButton
            actionIcon="codicon codicon-copy"
            actionName="複製項目路徑"
            actionDetail="複製該檔案或資料夾的完整路徑到系統剪貼簿"
            disabled={lastSelectedIndex === null}
            onClick={() => writeSystemClipboard("path")}
          />
        </ActionDropdown>
      </ActionGroup>

      <ActionGroup>
        <ActionButton
          actionIcon="codicon codicon-check-all"
          actionName="全選"
          actionDetail="選取目前顯示在表格中的所有項目"
          actionShortcut={["Ctrl", "A"]}
          onClick={selectAll}
          disabled={selectionCount === rows.length}
        />
        <ActionButton
          actionIcon="codicon codicon-clear-all"
          actionName="清除選取"
          actionDetail="取消選取目前已選取的所有項目"
          actionShortcut={["Ctrl", "Shift", "A"]}
          onClick={selectNone}
          disabled={selectionCount === 0}
        />
        <ActionButton
          actionIcon="codicon codicon-arrow-swap"
          actionName="反轉選取"
          actionDetail="取消選取已選取的項目，並選取未選取的項目"
          actionShortcut={["Ctrl", "I"]}
          onClick={selectInvert}
        />
      </ActionGroup>

      <ActionGroup>
        <ActionInput
          actionIcon="codicon codicon-checklist"
          actionName="目前選取"
          actionDetail="目前選取的數量"
          placeholder="選取數量"
          readOnly
          value={selectionCount.toString()}
        />
        <ActionButton
          actionIcon="codicon codicon-trash"
          actionName="刪除"
          actionDetail="刪除目前選取的項目"
          actionShortcut={["Delete"]}
          onClick={deleteItems}
          disabled={selectionCount === 0}
        />
        <ActionButton
          actionIcon="codicon codicon-copy"
          actionName="寫入剪貼簿"
          actionDetail="將目前選取的項目路徑暫存至剪貼簿"
          actionShortcut={["Ctrl", "C"]}
          onClick={writeClipboard}
          disabled={selectionCount === 0}
        />
      </ActionGroup>

      <ActionGroup>
        <ActionInput
          actionIcon="codicon codicon-clippy"
          actionName="剪貼簿內容"
          actionDetail="目前剪貼簿內的項目數量"
          placeholder="項目數量"
          readOnly
          value={clipboardCount.toString()}
        />
        <ActionButton
          actionIcon="codicon codicon-forward"
          actionName="放置"
          actionDetail="將目前剪貼簿內的項目放置到目前目錄"
          actionShortcut={["Ctrl", "V"]}
          onClick={readClipboard}
          disabled={clipboardCount === 0}
        />
      </ActionGroup>
    </Box>
  );
};

export { ActionBar };
