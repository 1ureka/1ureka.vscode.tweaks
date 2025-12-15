import React from "react";
import { Box, ButtonBase, InputBase } from "@mui/material";
import type { SxProps } from "@mui/system";
import { colorMix } from "@/utils/ui";

/**
 * 操作元件的大小（高度或寬度，取決於方向）
 */
const actionSize = { small: 26, medium: 30 };

type ActionGroupProps = {
  children: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  size?: "small" | "medium";
};

/**
 * 操作元件的容器，可排列多個操作元件，就算只有一個操作元件也必須使用此容器以確保樣式一致
 */
const ActionGroup = ({ children, orientation = "horizontal", size = "medium" }: ActionGroupProps) => {
  const flexDirection = orientation === "horizontal" ? "row" : "column";
  const height = orientation === "horizontal" ? actionSize[size] : undefined;
  const width = orientation === "vertical" ? actionSize[size] : undefined;

  const borderLeft = orientation === "horizontal" ? "2px solid" : undefined;
  const borderTop = orientation === "vertical" ? "2px solid" : undefined;

  return (
    <Box
      className="action-group"
      sx={{
        display: "flex",
        alignItems: "stretch",
        flexDirection,
        height,
        width,

        overflow: "hidden",
        borderRadius: 1,
        border: "2px solid",
        borderColor: "action.border",
        "&.action-group > *": { border: "none", borderLeft, borderTop, borderColor: "action.border" },
        "&.action-group > *:first-child": { borderLeft: "none", borderTop: "none" },

        "&.action-group button": {
          height: orientation === "horizontal" ? 1 : "auto",
          width: orientation === "vertical" ? 1 : "auto",
          aspectRatio: "1 / 1",
          "& i": { fontSize: actionSize[size] - 10 },
        },

        "&.action-group input": {
          fontSize: actionSize[size] - 12,
        },
      }}
    >
      {children}
    </Box>
  );
};

const actionButtonSx: SxProps = {
  display: "grid",
  placeItems: "center",
  bgcolor: "action.button",
  "&:hover": { bgcolor: colorMix("action.button", "text.primary", 0.9) },
  "&:active": { bgcolor: "action.active" },
};

const actionButtonActiveSx: SxProps = {
  display: "grid",
  placeItems: "center",
  bgcolor: "action.active",
};

const actionButtonDisabledSx: SxProps = {
  display: "grid",
  placeItems: "center",
  bgcolor: colorMix("action.button", "background.default", 50),
  color: "text.disabled",
};

type ActionButtonProps = {
  icon: `codicon codicon-${string}`;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
};

/**
 * 按鈕元件，單獨使用仍需要包在 ActionGroup 中
 */
const ActionButton = (props: ActionButtonProps) => {
  const { icon, onClick, active, disabled } = props;

  let sx: SxProps = actionButtonSx;
  if (disabled) {
    sx = actionButtonDisabledSx;
  } else if (active) {
    sx = actionButtonActiveSx;
  }

  return (
    <ButtonBase disableRipple onClick={onClick} sx={sx} disabled={disabled}>
      <i className={icon} style={{ display: "block" }} />
    </ButtonBase>
  );
};

const actionInputSx: SxProps = {
  minWidth: 0,
  width: 1,
  bgcolor: "background.input",
  px: 1,
  height: 1,
  "&:hover": { bgcolor: colorMix("background.input", "text.primary", 0.97) },
  "& input.MuiInputBase-input": { p: 0, height: 1 },
};

/**
 * 輸入框元件，單獨使用仍需要包在 ActionGroup 中
 */
const ActionInput = ({ value, onChange }: { value?: string; onChange?: (value: string) => void }) => {
  return <InputBase value={value} onChange={(e) => onChange?.(e.target.value)} sx={actionInputSx} />;
};

export { actionSize, ActionGroup, ActionButton, ActionInput };
