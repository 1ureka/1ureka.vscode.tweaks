import { memo, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { ActionButton, ActionDropdown, ActionGroup, ActionInput } from "@explorer/components/Action";
import { PropBoolean, PropEnum } from "@/webview-explorer/components/Props";
import { formatRelativeTime } from "@/utils/formatter";
import { setSchedule } from "@/utils";

import { dataStore, viewDataStore, navigateHistoryStore, navigationStore, viewStateStore } from "@explorer/store/data";
import { stageDestinationPath, navigateGotoFolder, navigateUp, refresh } from "@explorer/action/navigation";
import { navigateToFolder, navigateToNextFolder, navigateToPreviousFolder } from "@explorer/action/navigation";
import { navigateToImageGridView } from "@explorer/action/navigation";
import { createNewFolder } from "@explorer/action/operation";
import { setSortField, setSortOrder } from "@/webview-explorer/action/view";

/**
 * 重新整理按鈕，會顯示上次更新的相對時間，並且會自動更新
 */
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

/**
 * 處理路徑跳轉與歷史導覽相關功能
 */
const ActionGroupNavigation = memo(() => {
  const isCurrentRoot = dataStore((state) => state.isCurrentRoot);
  const history = navigateHistoryStore((state) => state.history);
  const currentHistoryIndex = navigateHistoryStore((state) => state.currentIndex);

  return (
    <ActionGroup>
      <ActionButton
        actionIcon="codicon codicon-arrow-left"
        actionName="上個資料夾"
        actionDetail="移動到上個資料夾"
        actionShortcut={["Alt", "Left Arrow"]}
        onClick={navigateToPreviousFolder}
        disabled={currentHistoryIndex === 0}
      />
      <ActionButton
        actionIcon="codicon codicon-arrow-right"
        actionName="下個資料夾"
        actionDetail="移動到下個資料夾"
        actionShortcut={["Alt", "Right Arrow"]}
        onClick={navigateToNextFolder}
        disabled={currentHistoryIndex >= history.length - 1}
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
  );
});

/**
 * 處理資料夾操作相關功能
 */
const ActionGroupManagement = memo(() => {
  const viewMode = viewDataStore((state) => state.viewMode);

  return (
    <ActionGroup>
      <ActionButton
        actionIcon="codicon codicon-new-folder"
        actionName="建立資料夾"
        actionDetail="建立一個新的資料夾"
        onClick={createNewFolder}
        disabled={viewMode === "images"}
      />
    </ActionGroup>
  );
});

/**
 * 處理路徑輸入相關功能 (goto)
 */
const ActionGroupAddress = memo(() => {
  const currentPath = navigationStore((state) => state.currentPath);
  const destPath = navigationStore((state) => state.destPath);
  const shortenedPath = dataStore((state) => state.shortenedPath);

  return (
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
  );
});

/**
 * 處理搜尋輸入相關功能
 */
const ActionGroupSearch = memo(() => {
  return (
    <ActionGroup>
      <ActionInput
        actionName="搜尋"
        actionDetail="模糊搜尋檔案或資料夾名稱"
        actionIcon="codicon codicon-search"
        placeholder="搜尋"
      />
    </ActionGroup>
  );
});

/**
 * 調整資料呈現的方式與排序規則
 */
const ActionGroupViewOptions = memo(() => {
  const currentPath = navigationStore((state) => state.currentPath);
  const viewMode = viewDataStore((state) => state.viewMode);

  const sortField = viewStateStore((state) => state.sortField);
  const sortOrder = viewStateStore((state) => state.sortOrder);

  return (
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
              onChange={setSortField}
              value={sortField}
              options={[
                { label: "名稱", value: "fileName" },
                { label: "修改日期", value: "mtime" },
                { label: "建立日期", value: "ctime" },
                { label: "大小", value: "size" },
              ]}
            />
            <Box sx={{ pr: 2 }}>
              <PropBoolean
                label="反向排序"
                value={sortOrder === "desc"}
                onChange={(value) => setSortOrder(value ? "desc" : "asc")}
              />
            </Box>
          </Box>
        </Box>
      </ActionDropdown>
    </ActionGroup>
  );
});

/**
 * 處理過濾器相關功能
 */
const ActionGroupFilter = memo(() => {
  const viewMode = viewDataStore((state) => state.viewMode);

  return (
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
  );
});

/**
 * 位於頂端的導覽列，包含路徑跳轉、資料夾管理、檢視選項等功能
 */
const NavigationBar = memo(() => (
  <Box sx={{ display: "grid", gridTemplateColumns: "auto auto 3fr 1fr auto auto", gap: 1, pb: 1 }}>
    <ActionGroupNavigation />
    <ActionGroupManagement />
    <ActionGroupAddress />
    <ActionGroupSearch />
    <ActionGroupViewOptions />
    <ActionGroupFilter />
  </Box>
));

export { NavigationBar };
