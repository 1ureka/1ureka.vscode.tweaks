import { useState } from "react";
import { Box, Divider } from "@mui/material";
import { Panel } from "@explorer/components/Panel";
import { List, type ListItem } from "@explorer/components/List";
import { ActionButton, ActionDropdown, ActionDropdownButton, ActionGroup } from "@explorer/components/Action";
import { navigateHistoryStore, navigationExternalStore, navigationStore } from "@explorer/store/data";
import { navigateToFolder, readDrives } from "@explorer/action/navigation";
import { formatFileSize } from "@/utils/formatter";

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

/**
 * 映射特殊資料夾到對應圖示
 */
const iconMap = {
  Desktop: "codicon codicon-vm",
  Documents: "codicon codicon-file-text",
  Downloads: "codicon codicon-download",
  Music: "codicon codicon-music",
  Pictures: "codicon codicon-file-media",
  Videos: "codicon codicon-device-camera-video",
  "3D Objects": "codicon codicon-symbol-method",
  OneDrive: "codicon codicon-globe",
  ":": "codicon codicon-server",
} as const;

/**
 * 從路徑中提取最後一個路徑段作為名稱
 */
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
          defaultRows={5}
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
  const icon = "codicon codicon-folder";

  if (mode === "history") {
    activeItemId = currentIndex.toString();
    listItems = historyPaths.map((path, i) => ({ id: i.toString(), icon, text: getBasename(path), detail: path }));
    listItems.reverse();
  }

  if (mode === "recent") {
    listItems = recentlyVisitedPaths.map((path) => ({ id: path, icon, text: getBasename(path), detail: path }));
  }

  if (mode === "frequent") {
    listItems = mostFrequentPaths.map((path) => ({ id: path, icon, text: getBasename(path), detail: path }));
  }

  return (
    <Panel title="瀏覽記錄">
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 1, alignItems: "start" }}>
        <List
          items={listItems}
          activeItemId={activeItemId}
          defaultRows={6}
          onClickItem={({ detail }) => detail && navigateToFolder({ dirPath: detail })}
          scrollToTopOnItemsChange={mode === "recent"}
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
  const currentPath = navigationStore((state) => state.currentPath);
  const systemFolders = navigationExternalStore((state) => state.systemFolders);
  const systemDrives = navigationExternalStore((state) => state.systemDrives);

  const getFolderIcon = (path: string) => {
    const keys = Object.keys(iconMap);
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (path.toLowerCase().includes(lowerKey)) {
        return iconMap[key as keyof typeof iconMap];
      }
    }
  };

  const systemFolderItems: ListItem[] = systemFolders.map((folder) => ({
    id: folder.Path,
    icon: getFolderIcon(folder.Path) || "codicon codicon-folder",
    text: folder.Name,
    detail: folder.Path,
  }));

  const volumnItems: ListItem[] = systemDrives.map((drive) => {
    let detail = [drive.DeviceID];

    if (drive.FileSystem) {
      detail.push(drive.FileSystem);
    }

    if (drive.FreeSpace && drive.Size) {
      const totalSize = formatFileSize(drive.Size);
      const usedSpace = formatFileSize(drive.Size - drive.FreeSpace);
      detail.push(`已使用 ${usedSpace} / ${totalSize}`);
    }

    detail = detail.filter(Boolean);

    return {
      id: drive.DeviceID + "\\",
      icon: "codicon codicon-server",
      text: drive.VolumeName ? `${drive.VolumeName} (${drive.DeviceID})` : `磁碟機 (${drive.DeviceID})`,
      detail: detail.join(" • "),
    };
  });

  return (
    <>
      {systemFolderItems.length > 0 && (
        <Panel title="系統">
          <List
            items={systemFolderItems}
            activeItemId={currentPath}
            defaultRows={6}
            onClickItem={({ id }) => navigateToFolder({ dirPath: id })}
          />
        </Panel>
      )}

      {volumnItems.length > 0 && (
        <Panel title="Volumes">
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 1, alignItems: "start" }}>
            <List
              items={volumnItems}
              activeItemId={currentPath}
              defaultRows={3}
              onClickItem={({ id }) => navigateToFolder({ dirPath: id })}
            />

            <ActionGroup orientation="vertical" size="small">
              <ActionButton
                actionIcon="codicon codicon-sync"
                actionName="重新整理"
                actionDetail="重新讀取磁碟機列表"
                onClick={readDrives}
              />
            </ActionGroup>
          </Box>
        </Panel>
      )}
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
