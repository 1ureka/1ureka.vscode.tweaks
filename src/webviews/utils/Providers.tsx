import React from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const getColorVar = (varName: string) => {
  const rootElement = document.documentElement;
  const computedStyle = window.getComputedStyle(rootElement);

  const fullVarName = `--vscode-${varName}`;
  const value = computedStyle.getPropertyValue(fullVarName).trim();

  return value || "#000000";
};

const theme = createTheme({
  defaultColorScheme: "dark", // 這與實際主題無關，因為是用 var(--vscode-xxx) 來取色，用 dark 是為了只需要定義一組色彩
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          main: getColorVar("button-background"),
          contrastText: getColorVar("button-foreground"),
        },
        background: {
          default: getColorVar("editor-background"),
          paper: getColorVar("sideBar-background"),
        },
        text: {
          primary: getColorVar("foreground"),
          secondary: getColorVar("descriptionForeground"),
          disabled: getColorVar("disabledForeground"),
        },
        divider: getColorVar("panel-border"),
      },
    },
  },
  typography: {
    fontFamily: "var(--vscode-editor-font-family)",
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export const ellipsisSx = {
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  wordBreak: "break-all",
} as const;
