import { Box } from "@mui/material";
import { ActionButton, ActionGroup, ActionInput } from "@@/fileSystem/components/Action";
import { clipboardStore, selectionStore, viewDataStore } from "@@/fileSystem/store/data";

import { deleteItems } from "@@/fileSystem/action/operation";
import { invokeClipboardPaste, setClipboard } from "@@/fileSystem/action/clipboard";
import { selectAll, selectInvert, selectNone } from "@@/fileSystem/action/selection";

const ActionBar = () => {
  const rows = viewDataStore((state) => state.entries);
  const lastSelectedIndex = selectionStore((state) => state.lastSelectedIndex);
  const selected = selectionStore((state) => state.selected);
  const clipboardEntries = clipboardStore((state) => state.entries);

  const selectionCount = selected.filter((v) => v).length;
  const clipboardCount = Object.keys(clipboardEntries).length;

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto 0.35fr 0.3fr", gap: 1, pt: 1 }}>
      <ActionGroup>
        <ActionInput
          actionName="重新命名"
          actionDetail="重新命名最後選取的項目"
          value={lastSelectedIndex !== null ? rows[lastSelectedIndex]?.fileName : ""}
        />
        <ActionButton actionIcon="codicon codicon-rename" actionName="重新命名" actionDetail="重新命名最後選取的項目" />
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
          onClick={deleteItems}
          disabled={selectionCount === 0}
        />
        <ActionButton
          actionIcon="codicon codicon-copy"
          actionName="寫入剪貼簿"
          actionDetail="將目前選取的項目路徑暫存至剪貼簿"
          actionShortcut={["Ctrl", "C"]}
          onClick={setClipboard}
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
          onClick={invokeClipboardPaste}
          disabled={clipboardCount === 0}
        />
      </ActionGroup>
    </Box>
  );
};

export { ActionBar };
