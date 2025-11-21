# 1ureka VSCode Extension

這是一個為個人使用開發的 VSCode 擴展，提供多種自訂功能來增強開發體驗。

## 目前包含的功能

### 1. 快速啟動外部應用程式 (Windows)

- **Blender 整合**：從檔案總管右鍵或命令面板快速開啟 Blender，支援直接開啟 `.blend` 檔案
- **Substance Painter 整合**：從檔案總管右鍵或命令面板快速開啟 Painter，支援直接開啟 `.spp` 檔案

### 2. 圖片牆 (Image Wall)

從檔案總管右鍵或命令面板選擇資料夾，在 WebView 中以網格形式瀏覽該資料夾的所有圖片。支援常見圖片格式（JPG、PNG、GIF、WEBP 等）。

### 3. 檔案時間戳顯示

在狀態列自動顯示當前檔案的建立時間與修改時間，支援**所有檔案類型**（文字檔、圖片、二進位檔等）。無需開啟檔案即可查看時間資訊。

### 4. 自訂樣式注入

安全地將自訂 CSS 樣式注入到 VSCode 介面中，採用修改而非刪除 CSP 的策略，確保通過 VSCode 的安全完整性檢查。

## 技術突破點

### 1. 安全的自訂樣式注入系統

#### 問題背景

市面上許多自訂 CSS/JS 注入插件（如 Custom JS and CSS Loader）為了確保所有自訂腳本和樣式都能載入，採取了**直接刪除 CSP (Content Security Policy) `<meta>` 標籤**的激進做法。這會導致：

- 完全移除 VSCode 的內容安全策略保護
- 無法通過 VSCode 啟動時的**安全完整性檢查 (Corrupt Installation Detection)**
- 每次啟動都會出現「VSCode 的安裝損毀」警告
- 暴露於潛在的 XSS 攻擊風險

#### 解決方案

本專案由於是個人使用，因此建構前就能得知來源有哪些，因此採用**修改而非刪除** CSP 的策略，實現了安全與功能性的平衡：

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

#### 與其他方案的對比

| 方案 | CSP 處理 | 安全性 | 完整性檢查 | 維護性 |
|------|---------|--------|-----------|--------|
| Custom JS and CSS Loader | 刪除 CSP 標籤 | ❌ 無保護 | ❌ 失敗 | ⚠️ 簡單但危險 |
| 本專案 | 修改 CSP 內容 | ✅ 保留保護 | ✅ 通過 | ✅ 結構化處理 |

### 2. SSR 精神的初始資料注入

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

### 3. 低優先級 Catch-All Editor 實現全檔案類型追蹤

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
