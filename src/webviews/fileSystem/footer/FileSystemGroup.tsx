import React from "react";
import { colorMix } from "@/utils/ui";
import { Box, ButtonBase } from "@mui/material";
import type { BoxProps, ButtonBaseProps, SxProps, Theme } from "@mui/material";

const footerFlexBoxSx: SxProps = {
  display: "flex",
  alignItems: "stretch",
  gap: 1,
  rowGap: 0,
  flexWrap: "wrap",
};

const FooterContainer = (props: BoxProps) => (
  <Box
    sx={{
      ...footerFlexBoxSx,
      justifyContent: "space-between",
      px: 2,
      bgcolor: colorMix("background-paper", "background-default", 80),
      borderBottom: "2px solid var(--vscode-editorGroup-border)",
    }}
    {...props}
  />
);

const FooterGroups = (props: BoxProps) => <Box sx={footerFlexBoxSx} {...props} />;

const FooterGroup = (props: BoxProps) => <Box sx={{ ...footerFlexBoxSx, gap: 0, flexWrap: "nowrap" }} {...props} />;

type CreateButtonSxParams = {
  active?: boolean;
  disabled?: boolean;
  sx?: SxProps<Theme>;
};

function createButtonSx({ active, disabled, sx }: CreateButtonSxParams): SxProps<Theme> {
  const bgcolor = active ? "table.selectedBackground" : "transparent";
  const hoverBgcolor = active ? "table.selectedHoverBackground" : "table.hoverBackground";
  const color = disabled ? "text.disabled" : "inherit";
  return { p: 0.8, bgcolor, color, "&:hover": { bgcolor: hoverBgcolor }, ...sx };
}

const FooterButton = ({ children, sx, disabled, active, ...props }: ButtonBaseProps & { active?: boolean }) => {
  return (
    <ButtonBase focusRipple disabled={disabled} sx={createButtonSx({ active, disabled, sx })} {...props}>
      {children}
    </ButtonBase>
  );
};

export { FooterContainer, FooterGroups, FooterGroup, FooterButton };
