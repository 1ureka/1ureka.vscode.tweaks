import { useState } from "react";
import { Box, Divider } from "@mui/material";
import { Panel } from "@@/fileSystem/components/Panel";
import { List, type ListItem } from "@@/fileSystem/components/List";
import { ActionButton, ActionDropdown, ActionDropdownButton, ActionGroup } from "@@/fileSystem/components/Action";
import { navigateHistoryStore, navigationStore } from "@@/fileSystem/store/data";
import { navigateToFolder } from "@@/fileSystem/action/navigation";

const fakeBookmarkItems: ListItem[] = [
  {
    id: "C:\\Users\\user\\Documents\\Python Projects",
    icon: "codicon codicon-folder",
    text: "Python Projects",
  },
  {
    id: "C:\\Users\\user\\Documents\\JavaScript Projects",
    icon: "codicon codicon-folder",
    text: "JavaScript Projects",
  },
  {
    id: "C:\\Users\\user\\Desktop\\work",
    icon: "codicon codicon-folder",
    text: "work",
  },
  {
    id: "C:\\Users\\user\\Desktop\\圖片",
    icon: "codicon codicon-folder",
    text: "圖片",
  },
];

const fakeSystemItems: ListItem[] = [
  {
    id: "C:\\Users\\user\\Desktop",
    icon: "codicon codicon-vm",
    text: "桌面",
  },
  {
    id: "C:\\Users\\user\\Documents",
    icon: "codicon codicon-file-text",
    text: "文件",
  },
  {
    id: "C:\\Users\\user\\Pictures",
    icon: "codicon codicon-file-media",
    text: "圖片",
  },
  {
    id: "C:\\Users\\user\\Music",
    icon: "codicon codicon-music",
    text: "音樂",
  },
  {
    id: "C:\\Users\\user\\Downloads",
    icon: "codicon codicon-download",
    text: "下載",
  },
  {
    id: "C:\\Users\\user\\Videos",
    icon: "codicon codicon-device-camera-video",
    text: "影片",
  },
  {
    id: "C:\\Users\\user\\OneDrive",
    icon: "codicon codicon-globe",
    text: "OneDrive",
  },
];

const fakeVolumnItems: ListItem[] = [
  {
    id: "C:\\",
    icon: "codicon codicon-server",
    text: "本機磁碟 (C:)",
  },
  {
    id: "D:\\",
    icon: "codicon codicon-server",
    text: "本機磁碟 (D:)",
  },
];

const getBasename = (path: string) => {
  const normalizedPath = path.replace(/[\\/]+$/, ""); // 去除末尾的斜線，防止 pop 出空字串 (避免 "/usr/local/bin/" 變成 "")
  const parts = normalizedPath.split(/[\\/]/); // 同時匹配 \ 或 / 進行分割
  return parts.pop() || path;
};

// ------------------------------------------------------------------------------

/**
 * 用於顯示路徑導航面板的書籤面板元件。
 */
const BookmarkPanel = () => {
  const [activeId, setActiveId] = useState("");

  return (
    <Panel title="書籤">
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 1, alignItems: "start" }}>
        <List
          items={fakeBookmarkItems.map((item) => ({ ...item, detail: item.id }))}
          activeItemId={activeId}
          onClickItem={(item) => setActiveId(item.id)}
          defaultRows={6}
          defaultActionExpanded
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <ActionGroup orientation="vertical" size="small">
            <ActionButton
              actionIcon="codicon codicon-add"
              actionName="添加書籤"
              actionDetail="為選取的/作用中的資料夾添加書籤"
              tooltipPlacement="right"
            />
            <ActionButton
              actionIcon="codicon codicon-chrome-minimize"
              actionName="刪除書籤"
              actionDetail="刪除所選的書籤"
              tooltipPlacement="right"
            />
            <ActionDropdown actionName="更多操作" actionDetail="更多書籤相關操作" tooltipPlacement="right">
              <ActionDropdownButton actionIcon="codicon codicon-close" actionName="清空" actionDetail="刪除所有書籤" />

              <Divider sx={{ my: 0.5 }} />

              <ActionDropdownButton
                actionIcon="codicon codicon-fold-up"
                actionName="移至頂部"
                actionDetail="將所選書籤移動到列表頂部"
                disabled
              />
              <ActionDropdownButton
                actionIcon="codicon codicon-fold-down"
                actionName="移至底部"
                actionDetail="將所選書籤移動到列表底部"
                disabled
              />
            </ActionDropdown>
          </ActionGroup>

          <ActionGroup orientation="vertical" size="small">
            <ActionButton
              actionIcon="codicon codicon-triangle-up"
              disabled
              actionName="移動書籤"
              actionDetail="將目前所在的書籤向上移動"
              tooltipPlacement="right"
            />
            <ActionButton
              actionIcon="codicon codicon-triangle-down"
              disabled
              actionName="移動書籤"
              actionDetail="將目前所在的書籤向下移動"
              tooltipPlacement="right"
            />
          </ActionGroup>
        </Box>
      </Box>
    </Panel>
  );
};

/**
 * 用於顯示路徑導航面板的記錄面板元件，包括歷史紀錄、最近瀏覽、最常瀏覽等功能。
 */
const HistoryPanel = () => {
  const [mode, setMode] = useState<"history" | "recent" | "frequent">("recent");

  const recentlyVisitedPaths = navigationStore((state) => state.recentlyVisitedPaths);
  const mostFrequentPaths = navigationStore((state) => state.mostFrequentPaths);
  const historyPaths = navigateHistoryStore((state) => state.history);
  const currentIndex = navigateHistoryStore((state) => state.currentIndex);

  const currentPath = navigationStore((state) => state.currentPath);

  let activeItemId: string = currentPath;
  let listItems: ListItem[] = [];

  if (mode === "history") {
    const reverseHistory = [...historyPaths].reverse();
    activeItemId = currentIndex.toString();
    listItems = reverseHistory.map((path, index) => ({
      id: (historyPaths.length - 1 - index).toString(),
      icon: "codicon codicon-folder",
      text: getBasename(path),
      detail: path,
    }));
  }

  if (mode === "recent") {
    listItems = recentlyVisitedPaths.map((path) => ({
      id: path,
      icon: "codicon codicon-folder",
      text: getBasename(path),
      detail: path,
    }));
  }

  if (mode === "frequent") {
    listItems = mostFrequentPaths.map((path) => ({
      id: path,
      icon: "codicon codicon-folder",
      text: getBasename(path),
      detail: path,
    }));
  }

  return (
    <Panel title="瀏覽記錄">
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 1, alignItems: "start" }}>
        <List
          items={listItems}
          activeItemId={activeItemId}
          defaultRows={6}
          onClickItem={({ detail }) => detail && navigateToFolder({ dirPath: detail })}
        />

        <ActionGroup orientation="vertical" size="small">
          <ActionButton
            actionIcon="codicon codicon-issue-reopened"
            actionName="最近瀏覽"
            actionDetail="以時間順序顯示最近瀏覽的資料夾"
            active={mode === "recent"}
            onClick={() => setMode("recent")}
          />

          <ActionDropdown actionName="更多模式" actionDetail="選擇其他瀏覽方式" tooltipPlacement="right">
            <ActionDropdownButton
              actionIcon="codicon codicon-history"
              actionName="歷史紀錄"
              actionDetail="以歷史順序顯示最近瀏覽的資料夾"
              tooltipPlacement="right"
              active={mode === "history"}
              onClick={() => setMode("history")}
            />
            <ActionDropdownButton
              actionIcon="codicon codicon-graph-left"
              actionName="最常瀏覽"
              actionDetail="以瀏覽次數排序顯示最常瀏覽的資料夾"
              active={mode === "frequent"}
              onClick={() => setMode("frequent")}
            />
          </ActionDropdown>
        </ActionGroup>
      </Box>
    </Panel>
  );
};

/**
 * 用於顯示路徑導航面板的系統和磁碟機面板元件。
 */
const RestPanels = () => {
  const [activeId, setActiveId] = useState("");

  return (
    <>
      <Panel title="系統">
        <List
          items={fakeSystemItems.map((item) => ({ ...item, detail: item.id }))}
          activeItemId={activeId}
          defaultRows={6}
          onClickItem={(item) => setActiveId(item.id)}
        />
      </Panel>

      <Panel title="Volumes">
        <List
          items={fakeVolumnItems.map((item) => ({ ...item, detail: item.id }))}
          activeItemId={activeId}
          onClickItem={(item) => setActiveId(item.id)}
        />
      </Panel>
    </>
  );
};

/**
 * 用於顯示路徑導航面板的元件，包含書籤、記錄、系統和磁碟機等面板。
 */
const NavigationPanels = () => (
  <Box sx={{ height: 1, overflowY: "auto", scrollbarGutter: "stable", p: 0.5, pr: 0.25 }}>
    <BookmarkPanel />
    <HistoryPanel />
    <RestPanels />
  </Box>
);

export { NavigationPanels };
