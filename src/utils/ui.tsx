import { createRoot } from "react-dom/client";
import { colord } from "colord";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import type { SxProps } from "@mui/material";

/**
 * 從 VSCode CSS 變數中取得值
 */
const getVarValue = (varName: string) => {
  const rootElement = document.documentElement;
  const computedStyle = window.getComputedStyle(rootElement);

  const fullVarName = `--vscode-${varName}`;
  const value = computedStyle.getPropertyValue(fullVarName).trim();

  if (!value) throw new Error(`無法取得 VSCode CSS 變數值: ${fullVarName}`);
  return value;
};

/**
 * 混合兩種 MUI 顏色，weight 為 color1 的比例 (0-100)
 */
const colorMix = (color1: string, color2: string, weight: number) => {
  if (weight < 1) weight = weight * 100;
  const color1CSSVar = `var(--mui-palette-${color1.replace(/\./g, "-")})`;
  const color2CSSVar = `var(--mui-palette-${color2.replace(/\./g, "-")})`;
  return `color-mix(in srgb, ${color1CSSVar} ${weight}%, ${color2CSSVar} ${100 - weight}%)`;
};

/**
 * 將任意 CSS 可接受的顏色設置不透明度
 */
const colorWithAlpha = (color: string, alpha: number) => {
  return `hsl(from ${color} h s l / ${alpha})`;
};

/**
 * 讓文字必定只會有一行，超出部分自動用省略號表示
 *
 * 可使用 `{...ellipsisSx, WebkitLineClamp: n}` 來設定多行省略
 */
const ellipsisSx: SxProps = {
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  wordBreak: "break-all",
};

/**
 * 讓文字置中對齊，對英文效果最明顯
 */
const centerTextSx: SxProps = {
  textBox: "trim-both cap alphabetic",
};

// ----------------------------------------------------------------------------

const theme = createTheme({
  cssVariables: true,
  defaultColorScheme: "dark", // 這與實際主題無關，因為是用 var(--vscode-xxx) 來取色，用 dark 是為了只需要定義一組色彩
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          main: colord(getVarValue("editor-selectionBackground")).alpha(1).lighten(0.1).toHex(),
        },
        background: {
          default: getVarValue("editor-background"),
          paper: getVarValue("menu-background"),
          content: getVarValue("sideBar-background"),
          input: colord(getVarValue("sideBar-background")).darken(0.05).toHex(),
        },
        action: {
          button: colord(getVarValue("editor-background")).lighten(0.15).toHex(),
          dropdown: colord(getVarValue("sideBar-background")).darken(0.025).toHex(),
          active: getVarValue("editor-selectionBackground"),
          border: getVarValue("menu-background"),
        },
        text: {
          primary: getVarValue("foreground"),
          secondary: getVarValue("descriptionForeground"),
          disabled: getVarValue("disabledForeground"),
        },
        tooltip: {
          background: getVarValue("editorHoverWidget-background"),
          border: getVarValue("editorHoverWidget-border"),
        },
        info: {
          main: getVarValue("editor-selectionBackground"),
        },
        divider: getVarValue("disabledForeground"),
      },
    },
  },
  typography: {
    fontFamily: getVarValue("editor-font-family"),
  },
  shape: {
    borderRadius: 6,
  },
});

// ----------------------------------------------------------------------------
/**
 * 啟動 React 應用程式
 */
const startReactApp = async (params: { App: React.FC; beforeRender?: () => Promise<void> | void }) => {
  const { App, beforeRender } = params;
  const container = document.getElementById("root");

  if (!container) {
    throw new Error("找不到 root 容器，無法啟動 React 應用程式。");
  }

  if (beforeRender) {
    const result = beforeRender();
    if (result instanceof Promise) {
      console.warn("等待 beforeRender 完成...");
      await result;
    }
  }

  createRoot(container).render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

export { startReactApp, ellipsisSx, centerTextSx, colorMix, colorWithAlpha };
