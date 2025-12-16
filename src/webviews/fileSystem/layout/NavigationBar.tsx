import { Box } from "@mui/material";
import { ActionButton, ActionDropdown, ActionGroup, ActionInput } from "@@/fileSystem/components/Action";

const NavigationBar = () => {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "auto auto 2fr 1fr auto auto", gap: 1, p: 1 }}>
      <ActionGroup>
        <ActionButton icon="codicon codicon-arrow-left" />
        <ActionButton icon="codicon codicon-arrow-right" />
        <ActionButton icon="codicon codicon-merge-into" />
        <ActionButton icon="codicon codicon-sync" />
      </ActionGroup>

      <ActionGroup>
        <ActionButton icon="codicon codicon-new-folder" />
      </ActionGroup>

      <ActionGroup>
        <ActionInput />
      </ActionGroup>

      <ActionGroup>
        <ActionInput icon="codicon codicon-search" placeholder="搜尋" />
      </ActionGroup>

      <ActionGroup>
        <ActionButton icon="codicon codicon-list-ordered" active />
        <ActionButton icon="codicon codicon-table" disabled />
        <ActionDropdown>
          <Box sx={{ p: 2, px: 5 }} />
        </ActionDropdown>
      </ActionGroup>

      <ActionGroup>
        <ActionButton icon="codicon codicon-filter" active />
        <ActionDropdown>
          <Box sx={{ p: 2, px: 5 }} />
        </ActionDropdown>
      </ActionGroup>
    </Box>
  );
};

export { NavigationBar };
