# 1ureka VSCode Extension

這是一個為個人使用開發的 VSCode 擴展，提供多種自訂功能來增強開發體驗。

## 目前包含的功能

### 1. 快速啟動外部應用程式 (Windows)

- **Blender 整合**：從檔案總管右鍵或命令面板快速開啟 Blender，支援直接開啟 `.blend` 檔案
- **Substance Painter 整合**：從檔案總管右鍵或命令面板快速開啟 Painter，支援直接開啟 `.spp` 檔案

### 2. 圖片牆 (Image Wall)

採用 **Material UI (MUI)** 打造的現代化圖片瀏覽體驗。從檔案總管右鍵或命令面板選擇資料夾，在 WebView 中以瀑布流形式展示該資料夾的所有圖片。

### 3. 檔案時間戳顯示

在狀態列自動顯示當前檔案的建立時間與修改時間，支援**所有檔案類型**（文字檔、圖片、二進位檔等）。無需開啟檔案即可查看時間資訊。

### 4. 自訂樣式注入

安全地將自訂 CSS 樣式注入到 VSCode 介面中，採用修改而非刪除 CSP 的策略，確保通過 VSCode 的安全完整性檢查。

## 技術突破點

### 1. Material UI 驅動的圖片牆視覺體驗

#### 設計理念

圖片牆功能採用 **Material UI (MUI)** 框架打造，突破傳統 VSCode WebView 的簡陋視覺，實現接近現代 Web 應用的流暢體驗。透過 MUI 的 Masonry 排版引擎，無論圖片尺寸比例如何不一致，都能自動計算最佳的瀑布流佈局，展現專業級的視覺效果。

#### 核心技術實現

##### 1. Masonry 瀑布流佈局

利用 MUI 的 `ImageList` 元件搭配 `variant="masonry"` 實現智慧排版：

```tsx
<ImageList variant="masonry" cols={columnCounts} gap={8}>
  {images.map(({ uri, fileName, filePath }) => (
    <ImageListItem key={uri}>
      <img src={uri} alt={fileName} loading="lazy" decoding="async" />
      <ImageListItemBar title={fileName} />
      <ButtonBase onClick={createHandleClick(filePath)} />
    </ImageListItem>
  ))}
</ImageList>
```

**技術優勢**：
- ✅ **自適應佈局**：自動計算不同寬高比圖片的最佳位置，避免傳統 grid 的空白問題
- ✅ **流暢排版**：CSS Grid 驅動的原生效能，無需 JavaScript 計算版面
- ✅ **響應式欄數**：透過 MUI 的 `useMediaQuery` 動態調整 2-5 欄，適配各種螢幕尺寸

##### 2. 響應式欄位系統

```tsx
const useColumnCounts = () => {
  const isLg = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const isMd = useMediaQuery((theme) => theme.breakpoints.up("md"));
  const isSm = useMediaQuery((theme) => theme.breakpoints.up("sm"));

  if (isLg) return 5;  // >= 1200px
  if (isMd) return 4;  // >= 900px
  if (isSm) return 3;  // >= 600px
  return 2;            // < 600px
};
```

透過 MUI 的斷點系統 (Breakpoints) 與媒體查詢 (Media Query)，根據視窗寬度智慧調整欄數，確保在任何裝置上都有最佳的視覺密度。

##### 3. 精緻的互動動畫

結合 MUI 的 `sx` prop 與 CSS transitions 實現多層次的 hover 效果：

```tsx
<ImageListItem
  sx={{
    "&:hover": {
      boxShadow: 3,                    // 陰影加深
      transform: "translateY(-4px)"    // 向上浮起
    },
    "&:hover > button": {
      bgcolor: "action.hover"          // 半透明遮罩
    },
    "&:hover > .image-list-item-bar": {
      opacity: 1                       // 檔名淡入
    },
    transition: "transform 0.2s, box-shadow 0.2s",
  }}
>
```

**互動細節**：
- 圖片本體：陰影加深 + 向上浮動 4px，模擬卡片抬起效果
- 透明遮罩：平時隱藏，hover 時淡入半透明深色背景
- 檔名標籤：平時透明，hover 時淡入顯示完整檔名
- 所有動畫使用 0.2s 統一過渡時間，確保視覺節奏一致

##### 4. VSCode 主題整合

透過 MUI 的 `createTheme` API 搭配 CSS 變數，實現與 VSCode 主題的無縫整合：

```tsx
const theme = createTheme({
  colorSchemes: {
    dark: {
      palette: {
        background: {
          default: "var(--vscode-editor-background)",
          paper: "var(--vscode-sideBar-background)",
        },
        text: {
          primary: "var(--vscode-foreground)",
          secondary: "var(--vscode-descriptionForeground)",
        },
        divider: "var(--vscode-panel-border)",
      },
    },
  },
  typography: {
    fontFamily: "var(--vscode-editor-font-family)",
  },
});
```

**整合優勢**：
- ✅ **自動主題同步**：隨 VSCode 主題切換自動更新配色，無需手動適配
- ✅ **視覺一致性**：使用 VSCode 原生顏色變數，確保視覺風格完全融入編輯器
- ✅ **字型同步**：採用編輯器字型，介面標題與檔名與 VSCode 保持一致

##### 5. 效能優化

```tsx
<img src={uri} alt={fileName} loading="lazy" decoding="async" />
```

- **Lazy Loading**：圖片僅在進入視窗時才載入，大幅減少初始載入時間
- **Async Decoding**：圖片解碼在獨立執行緒進行，避免阻塞主執行緒渲染
- **WebView 保留**：透過 `retainContextWhenHidden: true` 保留 WebView 狀態，切換 tab 時不重新載入

#### 視覺效果總結

- **瀑布流佈局**：Masonry 自動處理不同比例的圖片，無空白、無錯位
- **響應式設計**：2-5 欄自適應，手機到超寬螢幕都完美呈現
- **流暢動畫**：hover 時的浮起、陰影、遮罩、檔名顯示，多層次視覺回饋
- **主題整合**：完全適配 VSCode 明暗主題，彷彿原生功能
- **效能優異**：懶加載 + 異步解碼，百張圖片依然流暢

### 2. 安全的自訂樣式注入系統

#### 問題背景

市面上許多自訂 CSS/JS 注入插件（如 Custom JS and CSS Loader）為了確保所有自訂腳本和樣式都能載入，採取了**直接刪除 CSP (Content Security Policy) `<meta>` 標籤**的激進做法。這會導致：

- 完全移除 VSCode 的內容安全策略保護
- 無法通過 VSCode 啟動時的**安全完整性檢查 (Corrupt Installation Detection)**
- 每次啟動都會出現「VSCode 的安裝損毀」警告
- 暴露於潛在的 XSS 攻擊風險

#### 解決方案

本專案採用**雙階段注入策略**，結合建構時處理與執行時修改，實現安全與功能性的平衡：

##### 階段一：建構時的 CSS 內聯處理

透過 esbuild 的 loader 配置，在打包時就將 CSS 作為字串嵌入到 JavaScript 中：

```javascript
// esbuild.js
await build({
  entryPoints: ["src/extension.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  external: ["vscode"],
  outfile: "dist/extension.js",
  loader: {
    ".svg": "dataurl",
    ".css": "text"  // 關鍵：將 CSS 轉為字串
  },
});
```

```typescript
// 在程式碼中直接 import CSS
import customStyle from "../utils/customStyle.css";
// customStyle 現在是完整的 CSS 字串，無需額外讀檔
```

**優勢**：
- ✅ **零檔案操作**：CSS 內容已編譯進 JavaScript，不需執行時讀取外部檔案
- ✅ **單一產物**：extension.js 已包含所有樣式，簡化部署

##### 階段二：執行時的精準 CSP 修改

由於建構時已知所有外部資源來源（如 Google Fonts、jsDelivr CDN），採用**修改而非刪除** CSP 的策略：

```typescript
function allowExternalSources(htmlContent: string): string | null {
  const document = parseHtml(htmlContent);
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');

  if (!cspMeta) return null;

  let content = cspMeta.getAttribute("content") || "";

  // 僅添加必要的外部資源域名，而非刪除整個 CSP
  content = content.replace(/style-src([^;]*);/, (_match, group1) => {
    return `style-src${group1} https://fonts.googleapis.com;`;
  });

  content = content.replace(/font-src([^;]*);/, (_match, group1) => {
    return `font-src${group1} https://fonts.gstatic.com https://cdn.jsdelivr.net;`;
  });

  cspMeta.setAttribute("content", content);
  return document.toString();
}
```

```typescript
function injectCustomStyles(htmlContent: string): string | null {
  const document = parseHtml(htmlContent);
  const head = document.querySelector("head");

  if (!head) return null;

  // 直接將建構時內聯的 CSS 字串注入
  head.insertAdjacentHTML("beforeend", `<style data-injected-by="1ureka">${customStyle}</style>`);
  return document.toString();
}
```

**優勢**：
- ✅ **白名單機制**：僅允許已知的外部資源域名
- ✅ **保留原有保護**：CSP 的其他安全策略完全保留
- ✅ **通過完整性檢查**：不破壞 VSCode 的檔案結構

#### 與其他方案的對比

| 方案 | CSS 處理 | CSP 處理 | 安全性 | 完整性檢查 | 維護性 |
|------|---------|---------|--------|-----------|--------|
| Custom JS and CSS Loader | 執行時讀檔 | 刪除 CSP 標籤 | ❌ 無保護 | ❌ 失敗 | ⚠️ 簡單但危險 |
| 本專案 | 建構時內聯 | 精準修改 CSP | ✅ 白名單保護 | ✅ 通過 | ✅ 雙階段處理 |

#### 核心技術要點

1. **建構時優化**：透過 esbuild 的 `text` loader 將 CSS 轉為字串，消除執行時的檔案 I/O
2. **類型安全**：TypeScript 模組聲明確保 CSS import 的型別正確
3. **最小權限原則**：CSP 修改僅針對已知的外部資源，不擴大攻擊面
4. **可追溯性**：注入的樣式帶有 `data-injected-by` 標記，便於除錯和管理

### 3. SSR 精神的初始資料注入

#### 問題背景

VSCode WebView 與 React 應用的整合通常採用以下方式之一：

1. **訊息傳遞 (Message Passing)**：透過 `postMessage` 在 Extension 和 WebView 之間傳遞資料
2. **全域變數注入**：將資料直接寫入 `window` 物件

這兩種方式都存在時序問題：

- React 元件可能在資料準備好之前就渲染了
- 需要額外的載入狀態管理
- 首次渲染會出現閃爍或空白狀態

#### 解決方案

借鑒 **Server-Side Rendering (SSR)** 的精神，在 HTML 生成時就將初始資料嵌入，實現 React 元件的即時渲染：

```typescript
// Extension 端：將資料序列化並注入到 HTML 的 <script> 標籤中
function generateReactHtml({ initialData }: { initialData?: any }) {
  const initialDataScript = initialData
    ? `<script id="__data__" type="application/json">${serializeForHtml(initialData)}</script>`
    : "";

  return `<!DOCTYPE html><html>${initialDataScript}...</html>`;
}

function serializeForHtml(data: any): string {
  return JSON.stringify(data)
    .replace(/\\/g, "\\\\")
    .replace(/</g, "\\u003c")  // 防止 XSS 攻擊
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
```

```typescript
// WebView 端：React 元件啟動前先從 DOM 提取資料
export function getInitialData<T = any>(): T | null {
  const el = document.getElementById("__data__");
  if (!el || !el.textContent) return null;

  try {
    return JSON.parse(el.textContent);
  } catch (e) {
    console.error("Failed to parse initial data:", e);
    return null;
  }
}

// React 元件直接使用，無需等待或狀態管理
const data = getInitialData<{ images: ImageInfo[] }>() || { images: [] };
```

#### 優勢

- ✅ **零延遲渲染**：React 元件在首次渲染時就能拿到完整資料
- ✅ **無閃爍體驗**：不需要顯示 loading 狀態
- ✅ **型別安全**：透過 TypeScript 泛型確保資料型別正確
- ✅ **安全性**：透過 Unicode 轉義防止 XSS 攻擊
- ✅ **向下相容**：不妨礙後續使用 `postMessage` 進行動態更新

### 4. 低優先級 Catch-All Editor 實現全檔案類型追蹤

#### 問題背景

VSCode 的檔案時間戳顯示功能需要滿足以下需求：

1. 支援**所有檔案類型**（文字檔、圖片、PDF、二進位檔等）
2. 不能干擾原生編輯器的功能
3. 不能影響其他擴展的檔案處理
4. 需要追蹤使用者的檔案開啟行為

傳統的 `onDidChangeActiveTextEditor` 事件只能監聽文字編輯器，無法涵蓋圖片、PDF 等非文字檔案。

#### 解決方案

利用 VSCode 的 **Custom Editor API** 搭配 `priority: "option"` 設定，註冊一個最低優先級的 catch-all editor：

```typescript
// package.json 配置
{
  "customEditors": [
    {
      "viewType": "fileTimestamp.catchAll",
      "displayName": "File Timestamp Tracker",
      "selector": [{ "filenamePattern": "*" }],  // 匹配所有檔案
      "priority": "option"                       // 最低優先級
    }
  ]
}
```

```typescript
// FileTimestampEditorProvider：輕量級 Provider
export class FileTimestampEditorProvider implements vscode.CustomReadonlyEditorProvider {
  constructor(private onOpenDocument: (uri: vscode.Uri) => void) {}

  async openCustomDocument(uri: vscode.Uri): Promise<vscode.CustomDocument> {
    // 僅在檔案開啟時觸發回調，更新狀態列
    this.onOpenDocument(uri);
    return { uri, dispose: () => {} };
  }

  async resolveCustomEditor(): Promise<void> {
    // 不做任何事，讓 VSCode 使用預設編輯器
    // 這只是為了觸發 openCustomDocument
  }
}
```

```typescript
// 註冊時傳入狀態列更新回調
const provider = new FileTimestampEditorProvider((uri) => {
  updateStatusBarFromUri(statusBarItem, uri);
});

vscode.window.registerCustomEditorProvider("fileTimestamp.catchAll", provider, {
  webviewOptions: { retainContextWhenHidden: false },
  supportsMultipleEditorsPerDocument: true,
});
```

#### 核心技術要點

1. **`priority: "option"`**：確保此 editor 的優先級最低，VSCode 會優先使用：
   - 內建編輯器（文字、圖片、PDF 等）
   - 其他擴展註冊的 custom editor
   - 最後才會考慮我們的 catch-all editor

2. **`CustomReadonlyEditorProvider`**：不需要實際渲染內容，只需攔截檔案開啟事件

3. **`resolveCustomEditor` 空實作**：不建立 WebView，不干擾預設編輯器的渲染

4. **雙重監聽機制**：
   - `openCustomDocument`：追蹤檔案開啟（涵蓋所有檔案類型）
   - `onDidChangeTabs` / `onDidChangeTabGroups`：追蹤 tab 切換（涵蓋分割視窗等場景）

#### 優勢

- ✅ **全檔案類型支援**：文字檔、圖片、PDF、二進位檔等一網打盡
- ✅ **零干擾**：不影響任何原生功能或其他擴展
- ✅ **自動降級**：當有更高優先級的編輯器時，自動讓出控制權
- ✅ **效能優異**：不建立 WebView，不消耗額外資源
