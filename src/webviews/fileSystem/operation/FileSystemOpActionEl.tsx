import React from "react";
import { Box, ButtonBase, Typography, type SxProps } from "@mui/material";

/**
 * 用於分組操作按鈕的容器的樣式設定
 */
const groupContainerSx: SxProps = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
  borderRadius: 1,
  p: 1,
  bgcolor: "table.alternateRowBackground",
};

/**
 * 用於分組操作按鈕的容器元件的 Props 型別
 */
type GroupContainerProps = {
  icon?: `codicon codicon-${string}`;
  title?: string;
  children: React.ReactNode;
};

/**
 * 分組操作按鈕的容器元件
 */
const GroupContainer = ({ icon, title, children }: GroupContainerProps) => (
  <Box sx={groupContainerSx}>
    {title && (
      <Typography variant="caption" sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 0.5 }}>
        {icon && <i className={icon} style={{ display: "block" }} />} {title}
      </Typography>
    )}
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>{children}</Box>
  </Box>
);

/**
 * 操作按鈕的樣式設定
 */
const operationButtonSx: (active: boolean) => SxProps = (active) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 1.5,
  p: 0.5,
  pr: 1,
  borderRadius: 1,
  bgcolor: active ? "table.selectedBackground" : "transparent",
  "&:hover": { bgcolor: active ? "table.selectedBackground" : "table.hoverBackground" },
});

/**
 * 操作按鈕的 Props 型別
 */
type OperationButtonProps = {
  active?: boolean;
  icon: `codicon codicon-${string}`;
  label: string;
  onClick?: () => void;
};

/**
 * 檔案系統瀏覽器中的操作按鈕元件
 */
const OperationButton = ({ active, icon, label, onClick }: OperationButtonProps) => (
  <ButtonBase focusRipple sx={operationButtonSx(Boolean(active))} onClick={onClick}>
    <i className={icon} />
    <Typography variant="body2">{label}</Typography>
  </ButtonBase>
);

export { GroupContainer, OperationButton };
