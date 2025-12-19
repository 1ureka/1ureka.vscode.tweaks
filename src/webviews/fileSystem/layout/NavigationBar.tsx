import { useEffect, useState } from "react";
import { ActionButton, ActionDropdown, ActionGroup, ActionInput } from "@@/fileSystem/components/Action";
import { Box } from "@mui/material";
import { formatRelativeTime } from "@/utils/formatter";
import { setSchedule } from "@/utils";

import { dataStore } from "@@/fileSystem/store/data";
import { navigateUp, refresh } from "@@/fileSystem/action/navigation";
import { createNewFolder } from "@@/fileSystem/action/operation";

const ActionButtonRefresh = () => {
  const timestamp = dataStore((state) => state.timestamp);
  const [lastUpdate, setLastUpdate] = useState(formatRelativeTime(new Date(timestamp)));

  useEffect(() => {
    setLastUpdate(formatRelativeTime(new Date(timestamp)));

    const dispose = setSchedule({
      configs: [
        { timeout: 1000, count: 60 }, // 每秒更新，持續 1 分鐘
        { timeout: 60000, count: Infinity }, // 接著每分鐘更新
      ],
      task: () => {
        setLastUpdate(formatRelativeTime(new Date(timestamp)));
      },
    });

    return () => dispose();
  }, [timestamp]);

  return (
    <ActionButton
      actionIcon="codicon codicon-sync"
      actionName="重新整理"
      actionDetail={`上次更新: ${lastUpdate}`}
      actionShortcut={["Ctrl", "R"]}
      onClick={refresh}
    />
  );
};

const NavigationBar = () => {
  const currentPath = dataStore((state) => state.currentPath);
  const shortenedPath = dataStore((state) => state.shortenedPath);
  const isCurrentRoot = dataStore((state) => state.isCurrentRoot);

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "auto auto 3fr 1fr auto auto", gap: 1, pb: 1 }}>
      <ActionGroup>
        <ActionButton
          actionIcon="codicon codicon-arrow-left"
          actionName="上個資料夾"
          actionDetail="移動到上個資料夾"
          actionShortcut={["Alt", "Left Arrow"]}
        />
        <ActionButton
          actionIcon="codicon codicon-arrow-right"
          actionName="下個資料夾"
          actionDetail="移動到下個資料夾"
          actionShortcut={["Alt", "Right Arrow"]}
        />
        <ActionButton
          actionIcon="codicon codicon-merge-into"
          actionName="上層"
          actionDetail="移動到親代資料夾"
          actionShortcut={["Alt", "Up Arrow"]}
          onClick={navigateUp}
          disabled={isCurrentRoot}
        />
        <ActionButtonRefresh />
      </ActionGroup>

      <ActionGroup>
        <ActionButton
          actionIcon="codicon codicon-new-folder"
          actionName="建立資料夾"
          actionDetail="建立一個新的資料夾"
          onClick={createNewFolder}
        />
      </ActionGroup>

      <ActionGroup>
        <ActionInput actionName={currentPath} value={currentPath} displayValue={shortenedPath} />
      </ActionGroup>

      <ActionGroup>
        <ActionInput
          actionName="搜尋"
          actionDetail="模糊搜尋檔案或資料夾名稱"
          actionIcon="codicon codicon-search"
          placeholder="搜尋"
        />
      </ActionGroup>

      <ActionGroup>
        <ActionButton
          actionIcon="codicon codicon-list-ordered"
          actionName="顯示模式"
          actionDetail="用垂直表格顯示"
          active
        />
        <ActionButton
          actionIcon="codicon codicon-table"
          actionName="顯示模式"
          actionDetail="用 Grid 顯示 (即將推出)"
          disabled
        />
        <ActionDropdown actionName="顯示設定">
          <Box sx={{ p: 2, px: 5 }} />
        </ActionDropdown>
      </ActionGroup>

      <ActionGroup>
        <ActionButton actionIcon="codicon codicon-filter" actionName="過濾器" actionDetail="啟用/停用過濾功能" active />
        <ActionDropdown actionName="過濾設定">
          <Box sx={{ p: 2, px: 5 }} />
        </ActionDropdown>
      </ActionGroup>
    </Box>
  );
};

export { NavigationBar };
