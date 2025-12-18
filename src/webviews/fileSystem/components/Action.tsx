import { useState } from "react";
import { colorMix } from "@/utils/ui";
import { Box, ButtonBase, InputBase, Popover } from "@mui/material";
import type { SxProps } from "@mui/system";
import { Tooltip } from "@@/fileSystem/components/Tooltip";

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

        "&.action-group > .action-button > button": {
          height: orientation === "horizontal" ? 1 : "auto",
          width: orientation === "vertical" ? 1 : "auto",
          aspectRatio: "1 / 1",
          "& i": { fontSize: actionSize[size] - 10 },
        },

        "&.action-group input": {
          fontSize: actionSize.small - 12,
        },
      }}
    >
      {children}
    </Box>
  );
};

// -------------------------------------------------------------------------------------

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
  actionIcon: `codicon codicon-${string}`;
  actionName: string;
  actionDetail?: string;
  actionShortcut?: string[];
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
};

/**
 * 按鈕元件，單獨使用仍需要包在 ActionGroup 中
 * TODO: 自動註冊快捷鍵與 onClick 的關聯
 */
const ActionButton = (props: ActionButtonProps) => {
  const { actionIcon, actionName, actionDetail, actionShortcut, onClick, active, disabled } = props;

  let sx: SxProps = actionButtonSx;
  if (disabled) {
    sx = actionButtonDisabledSx;
  } else if (active) {
    sx = actionButtonActiveSx;
  }

  return (
    <Tooltip actionName={actionName} actionDetail={actionDetail} actionShortcut={actionShortcut}>
      <Box className="action-button">
        <ButtonBase disableRipple onClick={onClick} sx={sx} disabled={disabled}>
          <i className={actionIcon} style={{ display: "block" }} />
        </ButtonBase>
      </Box>
    </Tooltip>
  );
};

// -------------------------------------------------------------------------------------

const actionInputSx: SxProps = {
  minWidth: 0,
  width: 1,
  bgcolor: "background.input",
  px: 1,
  height: 1,
  "&:hover": { bgcolor: colorMix("background.input", "text.primary", 0.97) },
  "& input.MuiInputBase-input": { p: 0, height: 1 },
  "& i": { mr: 1 },
};

type ActionInputProps = {
  actionIcon?: `codicon codicon-${string}`;
  actionName: string;
  actionDetail?: string;
  actionShortcut?: string[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

/**
 * 輸入框元件，單獨使用仍需要包在 ActionGroup 中
 * TODO: 自動註冊快捷鍵與 onFocus 的關聯
 */
const ActionInput = (props: ActionInputProps) => {
  const { actionIcon, actionName, actionDetail, actionShortcut, placeholder, value, onChange } = props;
  return (
    <Tooltip actionName={actionName} actionDetail={actionDetail} actionShortcut={actionShortcut}>
      <InputBase
        startAdornment={actionIcon ? <i className={actionIcon} style={{ display: "block" }} /> : undefined}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        sx={actionInputSx}
      />
    </Tooltip>
  );
};

// -------------------------------------------------------------------------------------

const actionDropdownButtonSx: SxProps = {
  display: "grid",
  placeItems: "center",
  bgcolor: "action.dropdown",
  "&:hover": { bgcolor: colorMix("action.dropdown", "text.primary", 0.95) },
  "&:active": { bgcolor: "action.active" },
};

const actionDropdownButtonActiveSx: SxProps = {
  display: "grid",
  placeItems: "center",
  bgcolor: "action.active",
};

const actionDropdownSx: SxProps = {
  mt: 0.5,
  p: 1,
  bgcolor: "tooltip.background",
  border: 1,
  borderColor: "tooltip.border",
  borderRadius: 1,
  boxShadow: "0 2px 8px var(--vscode-widget-shadow)",
};

/**
 * 下拉選單元件，單獨使用仍需要包在 ActionGroup 中
 */
const ActionDropdown = ({ children }: { children: React.ReactNode }) => {
  const [anchorRef, setAnchorRef] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorRef);
  const buttonSx = open ? actionDropdownButtonActiveSx : actionDropdownButtonSx;

  return (
    <>
      <Box className="action-button">
        <ButtonBase disableRipple onClick={(e) => setAnchorRef(e.currentTarget)} sx={buttonSx}>
          <i className="codicon codicon-chevron-down" style={{ display: "block" }} />
        </ButtonBase>
      </Box>

      <Popover
        anchorEl={anchorRef}
        open={open}
        onClose={() => setAnchorRef(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{ paper: { elevation: 0, sx: actionDropdownSx } }}
      >
        {children}
      </Popover>
    </>
  );
};

// -------------------------------------------------------------------------------------

export { actionSize, ActionGroup, ActionButton, ActionInput, ActionDropdown };
