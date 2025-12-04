import React from "react";
import { colorMix } from "@/utils/ui";
import { Box, ButtonBase } from "@mui/material";
import type { BoxProps, ButtonBaseProps, SxProps } from "@mui/material";

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

const FooterButton = ({ children, sx, disabled, ...props }: ButtonBaseProps) => {
  const defaultSx: SxProps = {
    p: 0.8,
    "&:hover": { bgcolor: "table.hoverBackground" },
    color: disabled ? "text.disabled" : "inherit",
  };
  return (
    <ButtonBase focusRipple disabled={disabled} sx={{ ...defaultSx, ...sx }} {...props}>
      {children}
    </ButtonBase>
  );
};

export { FooterContainer, FooterGroups, FooterGroup, FooterButton };
