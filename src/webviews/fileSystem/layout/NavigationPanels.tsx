import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { Panel } from "@@/fileSystem/components/Panel";
import { List, type ListItem } from "@@/fileSystem/components/List";
import { ActionButton, ActionDropdown, ActionGroup } from "@@/fileSystem/components/Action";

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

const fakeHistoryItems: ListItem[] = [
  {
    id: "C:\\Users\\user\\Desktop",
    icon: "codicon codicon-vm",
    text: "桌面",
  },
  {
    id: "C:\\Users\\user\\Desktop\\Web_Project_2025",
    icon: "codicon codicon-folder",
    text: "Web_Project_2025",
  },
  {
    id: "C:\\Users\\user\\Desktop\\Web_Project_2025\\src",
    icon: "codicon codicon-folder",
    text: "src",
  },
  {
    id: "C:\\Users\\user\\Desktop\\Web_Project_2025\\src\\components",
    icon: "codicon codicon-folder",
    text: "components",
  },
  {
    id: "C:\\Users\\user\\Downloads",
    icon: "codicon codicon-download",
    text: "下載",
  },
  {
    id: "C:\\Users\\user\\Documents\\Python Projects",
    icon: "codicon codicon-folder",
    text: "Python Projects",
  },
  {
    id: "C:\\Users\\user\\Documents\\Python Projects\\DataAnalysis_Tool_20250617",
    icon: "codicon codicon-folder",
    text: "DataAnalysis_Tool_20250617",
  },
  {
    id: "C:\\Users\\user\\Documents",
    icon: "codicon codicon-file-text",
    text: "文件",
  },
  {
    id: "D:\\Backup\\Archives\\2024_Q4_Financial",
    icon: "codicon codicon-folder",
    text: "2024_Q4_Financial",
  },
  {
    id: "C:\\Users\\user\\Documents\\JavaScript Projects\\E-Commerce_FrontEnd",
    icon: "codicon codicon-folder",
    text: "E-Commerce_FrontEnd",
  },
  {
    id: "C:\\Users\\user\\Documents\\JavaScript Projects\\E-Commerce_FrontEnd\\assets",
    icon: "codicon codicon-folder",
    text: "assets",
  },
];

const NavigationPanels = () => {
  const [activeId, setActiveId] = useState("");

  return (
    <Box sx={{ height: 1, overflowY: "auto", scrollbarGutter: "stable", p: 0.5, pr: 0.25 }}>
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
              />
              <ActionButton
                actionIcon="codicon codicon-chrome-minimize"
                actionName="刪除書籤"
                actionDetail="刪除所選的書籤"
              />
              <ActionDropdown>
                <Typography sx={{ fontSize: 12 }}>12 Nov 2025 01:46</Typography>
                <Typography sx={{ fontSize: 12 }}>DD MMM YYYY HH:SS</Typography>
              </ActionDropdown>
            </ActionGroup>

            <ActionGroup orientation="vertical" size="small">
              <ActionButton
                actionIcon="codicon codicon-triangle-up"
                disabled
                actionName="移動書籤"
                actionDetail="將目前所在的書籤向上移動"
              />
              <ActionButton
                actionIcon="codicon codicon-triangle-down"
                disabled
                actionName="移動書籤"
                actionDetail="將目前所在的書籤向下移動"
              />
            </ActionGroup>
          </Box>
        </Box>
      </Panel>

      <Panel title="歷史記錄">
        <List
          items={fakeHistoryItems.map((item) => ({ ...item, detail: item.id }))}
          activeItemId={fakeHistoryItems[0].id}
          defaultRows={6}
        />
      </Panel>

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
    </Box>
  );
};

export { NavigationPanels };
