import { Box } from "@mui/material";
import { ActionButton, ActionDropdown, ActionGroup, ActionInput } from "@@/fileSystem/components/Action";

const NavigationBar = () => {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "auto auto 2fr 1fr auto auto", gap: 1, p: 1 }}>
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
        />
        <ActionButton
          actionIcon="codicon codicon-sync"
          actionName="重新整理"
          actionDetail="上次更新: 5 分鐘前"
          actionShortcut={["Crtl", "R"]}
        />
      </ActionGroup>

      <ActionGroup>
        <ActionButton
          actionIcon="codicon codicon-new-folder"
          actionName="建立資料夾"
          actionDetail="建立一個新的資料夾"
        />
      </ActionGroup>

      <ActionGroup>
        <ActionInput />
      </ActionGroup>

      <ActionGroup>
        <ActionInput icon="codicon codicon-search" placeholder="搜尋" />
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
        <ActionDropdown>
          <Box sx={{ p: 2, px: 5 }} />
        </ActionDropdown>
      </ActionGroup>

      <ActionGroup>
        <ActionButton actionIcon="codicon codicon-filter" actionName="過濾器" actionDetail="啟用/停用過濾功能" active />
        <ActionDropdown>
          <Box sx={{ p: 2, px: 5 }} />
        </ActionDropdown>
      </ActionGroup>
    </Box>
  );
};

export { NavigationBar };
