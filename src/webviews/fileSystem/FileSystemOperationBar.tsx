import React from "react";
import { Box, ButtonBase, Typography, type SxProps } from "@mui/material";
import { refresh } from "./navigate";

const operationBarContainerSx: SxProps = {
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: 1,
};

const OperationBarContainer = ({ children }: { children: React.ReactNode }) => (
  <Box sx={operationBarContainerSx}>{children}</Box>
);

const groupContainerSx: SxProps = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
  borderRadius: 1,
  p: 1,
  bgcolor: "table.alternateRowBackground",
};

const GroupContainer = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <Box sx={groupContainerSx}>
    {title && (
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {title}
      </Typography>
    )}
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>{children}</Box>
  </Box>
);

const expandedButtonSx: SxProps = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 1.5,
  p: 0.5,
  pr: 1,
  borderRadius: 1,
  "&:hover": { bgcolor: "table.hoverBackground" },
};

type ExpandedButtonProps = {
  icon: `codicon codicon-${string}`;
  label: string;
  onClick?: () => void;
};

const ExpandedButton = ({ icon, label, onClick }: ExpandedButtonProps) => (
  <ButtonBase focusRipple sx={expandedButtonSx} onClick={onClick}>
    <i className={icon} />
    <Typography variant="body2">{label}</Typography>
  </ButtonBase>
);

const operationBarHeaderSx: SxProps = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: 1,
  bgcolor: "background.paper",
  px: 1,
};

const OperationBarHeader = () => (
  <Box sx={{ position: "relative" }}>
    {/* 只是為了拿到高度 */}
    <Box sx={{ p: 1, opacity: 0 }}>
      <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
        操作區
      </Typography>
    </Box>

    <Box sx={operationBarHeaderSx}>
      <Box sx={{ color: "text.secondary" }}>
        <i className="codicon codicon-menu" style={{ color: "inherit", display: "block" }} />
      </Box>

      <ButtonBase focusRipple sx={{ borderRadius: 1, p: 0.5, "&:hover": { bgcolor: "table.hoverBackground" } }}>
        <i className="codicon codicon-layout-sidebar-left-dock" />
      </ButtonBase>
    </Box>
  </Box>
);

const FilterSystemOperationBar = () => {
  const handleRefresh = () => {
    refresh();
  };

  return (
    <OperationBarContainer>
      <OperationBarHeader />

      <GroupContainer>
        <ExpandedButton icon="codicon codicon-refresh" label="重新整理" onClick={handleRefresh} />
      </GroupContainer>

      <GroupContainer title="篩選...">
        <ExpandedButton icon="codicon codicon-file-submodule" label="全部" />
        <ExpandedButton icon="codicon codicon-file" label="僅限檔案" />
        <ExpandedButton icon="codicon codicon-folder" label="僅限資料夾" />
      </GroupContainer>

      <GroupContainer title="操作...">
        <ExpandedButton icon="codicon codicon-new-folder" label="新增資料夾" />
        <ExpandedButton icon="codicon codicon-new-file" label="新增檔案" />
      </GroupContainer>

      <GroupContainer title="在此開啟...">
        <ExpandedButton icon="codicon codicon-window" label="新工作區" />
        <ExpandedButton icon="codicon codicon-terminal" label="終端機" />
        <ExpandedButton icon="codicon codicon-folder-library" label="圖片牆" />
      </GroupContainer>
    </OperationBarContainer>
  );
};

export { FilterSystemOperationBar };
