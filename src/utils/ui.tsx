import React from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const getColorVar = (varName: string) => {
  const rootElement = document.documentElement;
  const computedStyle = window.getComputedStyle(rootElement);

  const fullVarName = `--vscode-${varName}`;
  const value = computedStyle.getPropertyValue(fullVarName).trim();

  return value || "#000000";
};

/**
 * 混合兩種顏色，weight 為 color1 的比例 (0-100)
 */
const colorMix = (color1: string, color2: string, weight: number) => {
  return `color-mix(in srgb, var(--mui-palette-${color1}) ${weight}%, var(--mui-palette-${color2}) ${100 - weight}%)`;
};

declare module "@mui/material/styles" {
  interface Palette {
    table: {
      alternateRowBackground: string;
      hoverBackground: string;
      selectedBackground: string;
      selectedHoverBackground: string;
    };
  }
  interface PaletteOptions {
    table: {
      alternateRowBackground: string;
      hoverBackground: string;
      selectedBackground: string;
      selectedHoverBackground: string;
    };
  }
}

const theme = createTheme({
  cssVariables: true,
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
        info: {
          main: getColorVar("editorInfo-foreground"),
        },
        table: {
          alternateRowBackground: getColorVar("list-hoverBackground"),
          hoverBackground: getColorVar("toolbar-hoverBackground"),
          selectedBackground: getColorVar("editor-selectionBackground"),
          selectedHoverBackground: colorMix("table-selectedBackground", "table-hoverBackground", 50),
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

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

const ellipsisSx = {
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  wordBreak: "break-all",
} as const;

export { Providers, ellipsisSx };
