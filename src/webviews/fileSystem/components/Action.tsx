import { useState } from "react";
import { centerTextSx, colorMix } from "@/utils/ui";
import { Box, ButtonBase, InputBase, Popover, Typography } from "@mui/material";
import type { SxProps, PopoverOrigin } from "@mui/material";
import { Tooltip } from "@@/fileSystem/components/Tooltip";

/**
 * 操作元件的 className
 */
const actionGroupClassName = "action-group";
const actionButtonClassName = "action-button";
const actionDropdownButtonClassName = "action-dropdown-button";
const actionInputClassName = "action-input";

/**
 * 操作元件的大小（高度或寬度，取決於方向）
 */
const actionSize = { small: 26, medium: 30 };

/**
 * tooltip 放置位置類型
 */
type TooltipPlacement = React.ComponentProps<typeof Tooltip>["placement"];

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
      className={actionGroupClassName}
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
        [`&.${actionGroupClassName} > *`]: { border: "none", borderLeft, borderTop, borderColor: "action.border" },
        [`&.${actionGroupClassName} > *:first-child`]: { borderLeft: "none", borderTop: "none" },

        [`&.${actionGroupClassName} > .${actionButtonClassName} > button`]: {
          height: orientation === "horizontal" ? 1 : "auto",
          width: orientation === "vertical" ? 1 : "auto",
          aspectRatio: "1 / 1",
          "& i": { fontSize: actionSize[size] - 10 },
        },

        [`&.${actionGroupClassName} input`]: {
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
  tooltipPlacement?: TooltipPlacement;
};

/**
 * 按鈕元件，單獨使用仍需要包在 ActionGroup 中
 * TODO: 自動註冊快捷鍵與 onClick 的關聯
 */
const ActionButton = (props: ActionButtonProps) => {
  const { actionIcon, actionName, actionDetail, actionShortcut, onClick, active, disabled } = props;
  const { tooltipPlacement } = props;

  let sx: SxProps = actionButtonSx;
  if (disabled) {
    sx = actionButtonDisabledSx;
  } else if (active) {
    sx = actionButtonActiveSx;
  }

  return (
    <Tooltip {...{ actionName, actionDetail, actionShortcut }} placement={tooltipPlacement}>
      <Box className={actionButtonClassName}>
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
  readOnly?: boolean;
  value?: string;
  displayValue?: string;
  onChange?: (value: string) => void;
  tooltipPlacement?: TooltipPlacement;
};

/**
 * 輸入框元件，單獨使用仍需要包在 ActionGroup 中
 * TODO: 自動註冊快捷鍵與 onFocus 的關聯
 */
const ActionInput = (props: ActionInputProps) => {
  const { actionIcon, actionName, actionDetail, actionShortcut, placeholder, value, onChange, readOnly } = props;
  const { tooltipPlacement, displayValue } = props;

  const [focus, setFocus] = useState(false);

  return (
    <Tooltip {...{ actionName, actionDetail, actionShortcut }} placement={tooltipPlacement}>
      <InputBase
        className={actionInputClassName}
        startAdornment={actionIcon ? <i className={actionIcon} style={{ display: "block" }} /> : undefined}
        placeholder={placeholder}
        value={focus ? value : displayValue ?? value}
        onChange={(e) => onChange?.(e.target.value)}
        sx={actionInputSx}
        readOnly={readOnly}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      />
    </Tooltip>
  );
};

// -------------------------------------------------------------------------------------

const actionDropdownSx: SxProps = {
  display: "grid",
  placeItems: "center",
  bgcolor: "action.dropdown",
  "&:hover": { bgcolor: colorMix("action.dropdown", "text.primary", 0.95) },
  "&:active": { bgcolor: "action.active" },
};

const actionDropdownActiveSx: SxProps = {
  display: "grid",
  placeItems: "center",
  bgcolor: "action.active",
};

const actionDropdownMenuSx: SxProps = {
  ".menu-bottom &": { mt: 0.5 },
  ".menu-top &": { mt: -0.5 },
  p: 1,
  bgcolor: "tooltip.background",
  border: 1,
  borderColor: "tooltip.border",
  borderRadius: 1,
  boxShadow: "0 2px 8px var(--vscode-widget-shadow)",
};

type ActionDropdownProps = {
  children: React.ReactNode;
  actionName: string;
  actionDetail?: string;
  menuPlacement?: "bottom" | "top";
  tooltipPlacement?: TooltipPlacement;
};

/**
 * 下拉選單元件，單獨使用仍需要包在 ActionGroup 中
 */
const ActionDropdown = (props: ActionDropdownProps) => {
  const { children, actionName, actionDetail, tooltipPlacement } = props;
  const { menuPlacement = "bottom" } = props;

  const [anchorRef, setAnchorRef] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorRef);
  const buttonSx = open ? actionDropdownActiveSx : actionDropdownSx;

  let anchorOrigin: PopoverOrigin = { vertical: "bottom", horizontal: "center" };
  let transformOrigin: PopoverOrigin = { vertical: "top", horizontal: "center" };
  let iconStyle: React.CSSProperties = { display: "block" };

  if (menuPlacement === "top") {
    anchorOrigin = { vertical: "top", horizontal: "center" };
    transformOrigin = { vertical: "bottom", horizontal: "center" };
    iconStyle = { display: "block", transform: "rotate(180deg)" };
  }

  return (
    <>
      <Tooltip actionName={actionName} actionDetail={actionDetail} placement={tooltipPlacement}>
        <Box className={actionButtonClassName}>
          <ButtonBase disableRipple onClick={(e) => setAnchorRef(e.currentTarget)} sx={buttonSx}>
            <i className="codicon codicon-chevron-down" style={iconStyle} />
          </ButtonBase>
        </Box>
      </Tooltip>

      <Popover
        className={`menu-${menuPlacement}`}
        anchorEl={anchorRef}
        open={open}
        onClose={() => setAnchorRef(null)}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        slotProps={{ paper: { elevation: 0, sx: actionDropdownMenuSx } }}
      >
        {children}
      </Popover>
    </>
  );
};

// -------------------------------------------------------------------------------------

const actionDropdownButtonSx: SxProps = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  width: 1,
  height: actionSize.small - 4,
  gap: 1.5,
  pr: 1.5,
  pl: 0.5,
  borderRadius: 0.5,
  bgcolor: "tooltip.background",
  "&:hover": { bgcolor: colorMix("tooltip.background", "text.primary", 0.95) },
  "&:active": { bgcolor: "action.active" },
  "&.active": { bgcolor: "action.active", "&:hover": { bgcolor: "action.active" } },
  "&.disabled": { color: "text.disabled" },
};

/**
 * 下拉選單內的按鈕元件
 */
const ActionDropdownButton = (props: Omit<ActionButtonProps, "actionShortcut">) => {
  const { actionIcon, actionName, actionDetail, onClick, active, disabled } = props;
  const { tooltipPlacement = "right" } = props;

  let className = "";
  if (active) className += "active ";
  if (disabled) className += "disabled ";

  return (
    <Tooltip actionName={actionName} actionDetail={actionDetail} placement={tooltipPlacement}>
      <Box className={actionDropdownButtonClassName}>
        <ButtonBase
          disableRipple
          className={className}
          onClick={onClick}
          disabled={disabled}
          sx={actionDropdownButtonSx}
        >
          <i className={actionIcon} style={{ display: "block" }} />
          <Typography variant="caption" sx={{ color: "inherit", ...centerTextSx }}>
            {actionName}
          </Typography>
        </ButtonBase>
      </Box>
    </Tooltip>
  );
};

export { actionGroupClassName, actionButtonClassName, actionDropdownButtonClassName, actionInputClassName };
export { actionSize, ActionGroup, ActionButton, ActionInput, ActionDropdown, ActionDropdownButton };
