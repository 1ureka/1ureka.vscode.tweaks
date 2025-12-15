import React from "react";
import { colord } from "colord";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

/**
 * 從 CSS 變數中取得 VSCode 主題顏色值
 */
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
  if (weight < 1) weight = weight * 100;
  const color1CSSVar = `var(--mui-palette-${color1.replace(/\./g, "-")})`;
  const color2CSSVar = `var(--mui-palette-${color2.replace(/\./g, "-")})`;
  return `color-mix(in srgb, ${color1CSSVar} ${weight}%, ${color2CSSVar} ${100 - weight}%)`;
};

// ----------------------------------------------------------------------------

declare module "@mui/material/styles" {
  interface TypeBackground {
    default: string;
    paper: string;
    content: string;
    input: string;
  }
  interface TypeAction {
    button: string;
    dropdown: string;
    active: string;
    border: string;
  }

  interface Palette {
    tooltip: {
      background: string;
      border: string;
    };
  }
  interface PaletteOptions {
    tooltip: {
      background: string;
      border: string;
    };
  }
}

const theme = createTheme({
  cssVariables: true,
  defaultColorScheme: "dark", // 這與實際主題無關，因為是用 var(--vscode-xxx) 來取色，用 dark 是為了只需要定義一組色彩
  colorSchemes: {
    dark: {
      palette: {
        background: {
          default: getColorVar("editor-background"),
          paper: getColorVar("menu-background"),
          content: getColorVar("sideBar-background"),
          input: colord(getColorVar("sideBar-background")).darken(0.05).toHex(),
        },
        action: {
          button: colord(getColorVar("editor-background")).lighten(0.15).toHex(),
          dropdown: colord(getColorVar("sideBar-background")).darken(0.025).toHex(),
          active: getColorVar("editor-selectionBackground"),
          border: getColorVar("menu-background"),
        },
        text: {
          primary: getColorVar("foreground"),
          secondary: getColorVar("descriptionForeground"),
          disabled: getColorVar("disabledForeground"),
        },
        tooltip: {
          background: getColorVar("editorHoverWidget-background"),
          border: getColorVar("editorHoverWidget-border"),
        },
        divider: getColorVar("panel-border"),
      },
    },
  },
  typography: {
    fontFamily: "var(--vscode-editor-font-family)",
  },
});

const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);

const ellipsisSx = {
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  wordBreak: "break-all",
} as const;

const centerTextSx = {
  textBox: "trim-both cap alphabetic",
};

export { Providers, ellipsisSx, centerTextSx, colorMix };
