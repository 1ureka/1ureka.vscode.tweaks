import { memo, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { ActionButton, ActionDropdown, ActionGroup, ActionInput } from "@explorer/components/Action";
import { PropBoolean, PropEnum } from "@/webview-explorer/components/Props";
import { formatRelativeTime } from "@/utils/formatter";
import { setSchedule } from "@/utils";

import { dataStore, viewDataStore, navigateHistoryStore, navigationStore } from "@explorer/store/data";
import { stageDestinationPath, navigateGotoFolder, navigateUp, refresh } from "@explorer/action/navigation";
import { navigateToFolder, navigateToNextFolder, navigateToPreviousFolder } from "@explorer/action/navigation";
import { navigateToImageGridView } from "@explorer/action/navigation";
import { createNewFolder } from "@explorer/action/operation";

const ActionButtonRefresh = memo(() => {
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
});

const NavigationBar = memo(() => {
  const currentPath = navigationStore((state) => state.currentPath);
  const destPath = navigationStore((state) => state.destPath);

  const viewMode = viewDataStore((state) => state.viewMode);
  const shortenedPath = dataStore((state) => state.shortenedPath);
  const isCurrentRoot = dataStore((state) => state.isCurrentRoot);

  const history = navigateHistoryStore((state) => state.history);
  const currentIndex = navigateHistoryStore((state) => state.currentIndex);

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "auto auto 3fr 1fr auto auto", gap: 1, pb: 1 }}>
      <ActionGroup>
        <ActionButton
          actionIcon="codicon codicon-arrow-left"
          actionName="上個資料夾"
          actionDetail="移動到上個資料夾"
          actionShortcut={["Alt", "Left Arrow"]}
          onClick={navigateToPreviousFolder}
          disabled={currentIndex === 0}
        />
        <ActionButton
          actionIcon="codicon codicon-arrow-right"
          actionName="下個資料夾"
          actionDetail="移動到下個資料夾"
          actionShortcut={["Alt", "Right Arrow"]}
          onClick={navigateToNextFolder}
          disabled={currentIndex >= history.length - 1}
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
          disabled={viewMode === "images"}
        />
      </ActionGroup>

      <ActionGroup>
        <ActionInput
          actionName={currentPath}
          value={destPath}
          displayValue={shortenedPath}
          onChange={stageDestinationPath}
          blurOnEnter
          onBlur={navigateGotoFolder}
        />
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
          onClick={() => navigateToFolder({ dirPath: currentPath })}
          active={viewMode === "directory"}
        />
        <ActionButton
          actionIcon="codicon codicon-table"
          actionName="顯示模式"
          actionDetail="用 Grid 顯示所有圖片"
          onClick={navigateToImageGridView}
          active={viewMode === "images"}
        />
        <ActionDropdown actionName="顯示設定">
          <Box sx={{ display: "grid", gridTemplateColumns: "auto auto", gap: 1.5, px: 1 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "right" }}>
              欄位
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <PropBoolean label="大小" value={true} onChange={() => {}} />
              <PropBoolean label="建立日期" value={false} disabled onChange={() => {}} />
            </Box>

            <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "right" }}>
              排序方式
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "stretch" }}>
              <PropEnum
                value="name"
                options={[
                  { label: "名稱", value: "name" },
                  { label: "修改日期", value: "modifiedAt" },
                  { label: "建立日期", value: "createdAt" },
                  { label: "大小", value: "size" },
                ]}
                onChange={() => {}}
              />
              <Box sx={{ pr: 2 }}>
                <PropBoolean label="反向排序" value={false} onChange={() => {}} />
              </Box>
            </Box>
          </Box>
        </ActionDropdown>
      </ActionGroup>

      <ActionGroup>
        <ActionButton
          actionIcon="codicon codicon-filter"
          actionName="過濾器"
          actionDetail="啟用/停用過濾功能"
          active
          disabled={viewMode === "images"}
        />
        <ActionDropdown actionName="過濾設定">
          <Box sx={{ p: 2, px: 5 }} />
        </ActionDropdown>
      </ActionGroup>
    </Box>
  );
});

export { NavigationBar };
