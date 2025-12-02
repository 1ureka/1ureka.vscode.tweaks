# 1ureka's VSCode Extension

個人使用的 VSCode 擴充套件，整合多種實用功能。

# 1. 主要功能

## 圖片檢視器

- 設計用來取代 VSCode 預設圖片編輯器
- JS 層重新實現 object-fit: contain 的邏輯，使初始的骨架與圖片一定能完美對齊
- 支援滑鼠/觸控板縮放、平移、慣性滾動
- 右鍵選單可快速重設視角
- 內建吸管工具，一鍵取色並複製
- 右鍵選單提供 "導出為..." 選項，可將圖片另存為其他格式
- 導出完成後，使用者可以點擊通知中的 "開啟檔案" 快速比較差異

## 圖片牆

- 右鍵資料夾「以圖片牆顯示」，或使用命令面板「開啟圖片牆」瀏覽任意位置的圖片
- 提供三種布局模式（標準、編織、磚牆）和三種尺寸（小、中、大），可在右鍵選單即時切換
- 預設智慧瀑布流佈局（磚牆模式），完美適應當資料夾中有各種尺寸圖片時的情況
- 響應式設計，無論面板如何分割或調整大小，都能正確排版並顯示圖片
- 漸進式載入機制，先快速掃描所有圖片的元資料，顯示骨架與排版，確保初始畫面無閃爍
- 自動壓縮圖片，經過測試在 50 張圖片且每張圖片都超過 50MB 也能高效顯示且不影響滾動體驗
- 分頁機制與快速元資料讀取，支援上達數千張圖片的資料夾
- 點擊圖片即可在圖片檢視器中開啟

## 圖片剪貼簿

- 完整實作上述功能的剪貼簿操作，避免由於 VSCode 原生選單中的複製選項無法刪除，造成誤導
- 在圖片檢視器右鍵選單有複製該張圖片的選項
- 在圖片牆右鍵任一圖片的選單中也有複製該張圖片的選項
- 在 Windows 系統上，複製與剪下的是圖片本身而非路徑
- 該功能甚至支援 Windows 原生無法處理的 WebP、TIFF 等格式寫入剪貼簿
- 複製大型圖片時顯示實時進度，提供即時回饋

## 檔案元資料顯示

- 狀態列自動顯示當前檔案的建立時間、修改時間、大小等資訊
- 支援所有檔案類型，甚至包括 VsCode 原生無法開啟的任意二進位檔
- 適合管理包含非程式碼檔案的專案
- 針對圖片檔案提供特殊 UI，額外顯示解析度、長寬比、格式、色彩空間、通道等資訊

## 檔案系統瀏覽器

- 右鍵資料夾「以檔案系統瀏覽器顯示」，或使用命令面板「開啟檔案系統瀏覽器」瀏覽任意位置的檔案
- 類似作業系統的檔案總管，但使用仿雲端硬碟的現代化介面，目標是再也不需要打開系統檔案總管
  <!-- - 讓 VsCode 能夠更輕鬆的與外部互動，比如將下載資料夾中的檔案移動到工作區中 -->
  <!-- - 在 VsCode 原有工作區的樹狀檢視、能快速理解檔案結構的基礎上，提供更靈活的本地操作能力 -->
- 實現完整路由，包括瀏覽資料夾、回到上層、麵包屑導航、開啟檔案並顯示在 VsCode 編輯器等
- 實現完整排序功能，支援依名稱、大小、建立時間、修改時間排序，並可切換升冪/降冪
- 支援完整的表格操作，排序、篩選、選取，所有操作皆有響應式視覺回饋

## 檔案系統瀏覽器 - 表格

- **打破既定，利用 CSS 機制**

  - 不採用原生 HTML 表格 (`<table>`) 元素，也不採用 MUI 的 `<Table>` 元件，而是從零打造
  - 採用 `flex: N` 搭配 `minWidth: 0` 的佈局策略，實現欄位寬度的自動分配與響應式調整
  - 圖示欄使用固定寬度，文字欄位依據權重 (weight，也就是 flex 屬性) 動態分配剩餘空間
  - 相較於傳統方案的優勢：
    - 使用 `useEffect` 監聽容器寬度並計算 width：需要額外的狀態管理、渲染循環，且在視窗調整時會有延遲
    - 使用百分比寬度：無法處理固定寬度欄位（如圖示欄），且欄位數量變化時需要重新計算所有百分比
    - `flex: N` 方案：瀏覽器原生處理，零 JavaScript 成本，完美支援混合固定與動態寬度，響應式無延遲

- **虛擬化列表實現**

  - 由於不是使用 table 元件為基礎，因此該專案的表格可以輕易的虛擬化
  - 僅渲染可視區域內的列表項目，大幅降低 DOM 節點數量與記憶體佔用
  - 配合 Flexbox 佈局的輕量級特性，確保滾動時的流暢體驗
  - 即使資料夾包含數萬個檔案，也能維持原生檔案總管的效能表現

## 檔案系統瀏覽器 - 資料流

- **前後端通訊架構**

  - 前端發送請求時透過請求佇列系統確保操作依序執行，從根本上避免競態條件
  - 佇列系統同時作為載入狀態的可靠來源：只要佇列中有待處理的請求，loading 狀態就為 true
  - 全局載入指示器利用 CSS 動畫延遲顯示，避免瞬間完成(0.15s)的操作造成閃爍，提升使用體驗

- **三層狀態管理**

  - 前端採用 Zustand 狀態管理，將資料分為三個層次，形成單向依賴鏈
  - 實際資料層 (Data Store)：儲存延伸主機回傳的檔案系統原始資料
  - 檢視狀態層 (View Store)：儲存使用者的檢視偏好（排序欄位、篩選條件等）
  - 檢視資料層 (View Data Store)：儲存需要依賴於上述兩者的資料 (經過檢視條件處理後的資料、選取狀態等)

- **依賴鏈與單向資料流**

  - 利用 Zustand 的同步訂閱機制與 JavaScript 事件循環特性，建立依賴鏈自動更新系統
  - 當資料層 (Data Store) 或檢視狀態層 (View Store) 更新時，自動觸發檢視資料層 (View Data Store) 重新計算
  - 計算流程：篩選 → 排序 → 附加圖示 → 重置選取狀態，整個更新鏈在單一事件循環內同步完成
  - 保證原子性與一致性，無論更新來源是使用者操作或作業系統檔案系統變更
  - 依賴鏈同時也是彈性的，比如當使用者切換選取狀態，僅須更新 View Data 的 selected 陣列而無需重新計算檢視資料

- **計算與渲染分離**
  - 所有資料轉換邏輯（篩選、排序、分頁）完全在狀態層的訂閱回調中執行
  - React 元件僅負責讀取最終狀態並渲染，避免在渲染階段進行昂貴的計算
  - 配合虛擬化列表與 Flexbox 佈局，達到架構清晰與效能極致的雙重目標
  - 整個專案一個 `useEffect` 也沒有，真正做到 React 所說的 `UI = f(state)`

## 檔案系統瀏覽器 - 操作區

- 檔案系統瀏覽器左側有對於瀏覽器所在目錄的操作區
- 提供重新整理按鈕與最後更新時間顯示，整理交由使用者自行決定時機
- 篩選區提供即時過濾顯示檔案與資料夾的功能
- 提供常用的檔案操作按鈕（新增資料夾、新增檔案等）
- 「在此開啟...」功能組，提供快速在當前路徑開啟新工作區、終端機或是該插件的圖片牆等

## 自訂樣式注入

- 比起 `Custom JS and CSS Loader` 能更安全注入自訂 CSS 到 VSCode 介面
- 透過採用修改而非刪除 CSP 的策略，通過安全完整性檢查
- 以及建構插件時將 CSS 內聯為字串，消除執行時的檔案 I/O 也減少了安全風險

## 外部應用程式整合 (Windows)

- 右鍵 `.blend` 檔案快速以裝置中最新的 Blender 開啟
- 右鍵 `.spp` 檔案快速以裝置中最新的 Substance Painter 開啟
- 命令選擇區也可直接啟動 Substance Painter 或 Blender
- 若應用位置特殊或想指定版本，可在 VsCode 設定中自訂路徑

# 2. 訊息框架

## 訊息通訊的種類與挑戰

在 VSCode 擴展開發中，延伸主機（Node.js 環境）與 Webview（瀏覽器環境）之間存在著嚴格的環境隔離。兩者無法直接共享記憶體或呼叫彼此的函數，所有通訊都必須透過訊息傳遞機制實現。然而，這種機制所帶來的複雜性遠超表面所見。

首先是究竟如何確保型別一致，若只是在呼叫端使用斷言太過寬鬆，而傳統的映射或 Record 雖然能解決型別安全問題，卻犧牲了通用性與擴展性，且強迫將不同功能的 API 綁定在同一個物件上，導致耦合度過高。並且上述的方案都假設所謂 handler 只存在於延伸主機端，然而實際上，前端同樣也會有自己的 handler 定義，這些 handler 可能會希望由右鍵選單觸發，這就引出了第二個挑戰。

第二個挑戰，是 VSCode 右鍵選單的特殊性。當使用者在 webview 上按右鍵並選擇某個 command 時，該 command 實際上是在延伸主機環境中被觸發的。此時，command 回調函數無法直接存取 webview 的當前狀態（如使用者選取了哪些項目），因為它運行在完全獨立的環境中。這導致需要一種「轉發機制」：延伸主機先通知前端「使用者想執行某操作」，前端根據自身狀態準備完整參數後，再透過正常的請求流程回傳給延伸主機處理。

綜合以上挑戰，一個擴展插件至少需要處理三種核心訊息類型：

1. **前端請求 (Invoke)**：前端呼叫延伸主機的 handler，需要等待結果並確保型別安全
2. **命令轉發 (Forward)**：延伸主機將 command 訊息轉發給前端，讓前端根據自身狀態 Invoke，或者直接使用前端的 handler
3. **初始資料注入 (Initial Data)**：在 webview HTML 中預先注入資料，避免載入閃爍與額外的請求延遲

## 框架設計理念與實現

面對上述複雜性，本專案選擇自行實現一套訊息框架，而非依賴現有方案。這個決策是基於對擴展開發特殊需求的深刻理解：需要一個既能保證型別安全、又不犧牲靈活性與獨立性的解決方案。

### 型別安全與環境無關性

框架的核心是一個簡單卻強大的型別定義：

```typescript
type API = {
  id: string;
  handler: (params: any) => any | Promise<any>;
};
```

這個 `API` 型別定義了一個「處理函數」的抽象概念，它只包含兩個屬性：唯一識別碼 `id` 與實際處理邏輯 `handler`。關鍵在於，這個型別定義完全不依賴任何執行環境，既不需要 VSCode API、也不需要瀏覽器 API。它只是一個純粹的 TypeScript 型別，可以代表任何環境中的 handler，同時可以在任何環境中被導入並作為泛型參數使用。

### 獨立的訊息通道與架構

傳統的訊息框架往往採用「集中式註冊」的設計模式，例如維護一個 `apiMap` 或 `apiRecord` 物件，將所有 API 的 id 與 handler 對應關係集中管理。這種做法看似清晰，實則帶來了耦合性問題：每次新增 API 都需要修改這個中央註冊表，所有 API 的生命週期被綁定在一起。

本框架採用完全相反的策略：**每個 API 的註冊與監聽都是獨立的**。延伸主機透過 `onDidReceiveInvoke` 單獨註冊每個 handler，前端透過 `invoke` 單獨發起每個請求，兩者之間沒有任何中央協調機制。唯一的連接點是 `id` 字串與型別定義。

#### 前端發送：invoke 與 onReceiveCommand

前端環境提供兩個核心函數，分別對應「主動請求」與「被動接收命令」兩種場景：

**invoke**：用於前端主動呼叫延伸主機的處理函數並等待回應

```typescript
function invoke<T extends API = never>(id: T["id"], params: Parameters<T["handler"]>[0]): Promised<T["handler"]> {
  const { promise, resolve } = defer<Awaited<ReturnType<T["handler"]>>>();
  const requestId = crypto.randomUUID();

  const message: InvokeMessage = { type: "1ureka.invoke", requestId, handlerId: id, params };
  vscode.postMessage(message);

  const handleMessage = (event: MessageEvent<InvokeResponseMessage>) => {
    const message = event.data;
    if (message.type === "1ureka.invoke.response" && message.requestId === requestId && message.handlerId === id) {
      window.removeEventListener("message", handleMessage);
      resolve(message.result);
    }
  };

  window.addEventListener("message", handleMessage);
  return promise;
}
```

這個函數的核心機制是「請求-回應配對」：透過 `requestId` 確保回應與請求正確對應（因為可能同時有多個請求在進行中）。當延伸主機回應時，監聽器會比對 `requestId` 與 `handlerId`，確認後才 resolve Promise。這讓非同步的訊息通道能夠以同步 `await` 的方式使用。

**onReceiveCommand**：用於接收延伸主機轉發的命令訊息

```typescript
function onReceiveCommand<T extends API = never>(id: T["id"], handler: () => void) {
  const handleMessage = (event: MessageEvent<ForwardCommandMessage>) => {
    const message = event.data;
    if (message.type === "1ureka.command" && message.action === id) {
      handler();
    }
  };

  window.addEventListener("message", handleMessage);
}
```

這個函數更為簡潔，因為命令轉發是單向的、不需要回應。當訊息的 `action` 與 `id` 匹配時，直接執行 handler。注意這裡的 handler 沒有參數，因為前端需要自行從狀態管理中讀取所需資訊（這正是轉發機制的意義所在）。

#### 延伸主機接收與發送：onDidReceiveInvoke 與 forwardCommandToWebview

延伸主機環境同樣提供兩個核心函數，與前端形成對稱的通道：

**onDidReceiveInvoke**：註冊處理函數，回應前端的 invoke 請求

```typescript
function onDidReceiveInvoke<T extends API = never>(panel: vscode.WebviewPanel, id: T["id"], handler: T["handler"]) {
  const disposable = panel.webview.onDidReceiveMessage(async (message) => {
    const { type, requestId, handlerId, params } = message as InvokeMessage;

    if (type === "1ureka.invoke" && handlerId === id) {
      const result = await handler(params);
      const responseMessage: InvokeResponseMessage = {
        type: "1ureka.invoke.response",
        requestId,
        handlerId: id,
        result,
      };

      panel.webview.postMessage(responseMessage);
    }
  });

  panel.onDidDispose(() => disposable.dispose());
}
```

這個函數的特點是「獨立監聽」：每次呼叫都會建立一個新的監聽器，只處理匹配 `handlerId` 的訊息。執行 handler 後，將結果與原始的 `requestId` 一起發送回前端，確保前端能正確配對。監聽器會在 panel 銷毀時自動清理，避免記憶體洩漏。

**forwardCommandToWebview**：將命令意圖轉發給前端處理

```typescript
function forwardCommandToWebview<T extends API = never>(panel: vscode.WebviewPanel, action: T["id"]) {
  const message: ForwardCommandMessage = { type: "1ureka.command", action };
  panel.webview.postMessage(message);
}
```

這個函數非常直接，只是發送一個帶有 `action` 的訊息，通知前端「使用者想執行這個操作」。前端收到後會根據自身狀態決定如何處理（可能再次呼叫 `invoke`，也可能純前端處理）。

### 開放封閉原則與實際例子

透過以上的兩個設計，我們實現了一個極致解耦合的訊息通道。每個訊息的發送與接收都是獨立的，互不干擾，且都享有相同的型別安全保證。並且 `API` 型別的設計使得該框架與環境無關，不論是前端還是延伸主機，都可以自由定義自己的 API，並且可以導入對方的 API 定義，只要帶入正確的泛型參數即可。

這種架構的優勢在於可擴展性與可維護性：新增一個功能模組時，只需定義自己的 API 型別、註冊自己的 handler、在前端呼叫自己的 invoke，完全不需要了解其他模組的實作。這種「按需註冊、互不干擾」的模式，讓專案能夠水平擴展而不增加複雜度。

比如一個讀取目錄的 API，可以在延伸主機端這樣定義：

```typescript
// 延伸主機定義的處理函數
async function handleReadDirectory(params: { dirPath: string }): Promise<ReadDirectoryResult> {
  /* ... */
}
type ReadDirAPI = { id: "readDirectory"; handler: typeof handleReadDirectory };

// 延伸主機註冊該 handler
onDidReceiveInvoke<ReadDirAPI>(panel, "readDirectory", handleReadDirectory);
```

前端則可以直接導入這個型別定義（注意使用 `type` 關鍵字確保只導入型別而非實際代碼），並在呼叫時獲得完整的型別推斷：

```typescript
import type { ReadDirAPI } from "@/providers/fileSystemProvider";

// TypeScript 會自動推斷參數與回傳值型別
const result = await invoke<ReadDirAPI>("readDirectory", { dirPath: "/some/path" });
// result 的型別會自動推斷為 Promise<ReadDirectoryResult>
```

又或者一個轉發動作：

```typescript
// 延伸主機定義的處理函數
async function handleCopyFiles({ selectedPaths }: { selectedPaths: string[] }): void {
  /* ... */
}
type CopyFilesAPI = { id: "copyFiles"; handler: typeof handleCopyFiles };

// 延伸主機註冊該 handler
onDidReceiveForward<CopyFilesAPI>(panel, "copyFiles", handleCopyFiles);

// 使用者在 webview 右鍵選單觸發 command，由延伸主機轉發給前端
forwardCommandToWebview<CopyFilesAPI>(panel, "copyFiles");
```

前端則有

```typescript
// 前端註冊該轉發事件
onReceiveCommand<CopyFilesAPI>("copyFiles", () =>
  invoke<CopyFilesAPI>("copyFiles", { selectedPaths: store.getState().selectedPaths })
);

// 當然前端也可以有自己的按鈕呼叫同樣的 API
onClick={() =>
  invoke<CopyFilesAPI>("copyFiles", { selectedPaths: store.getState().selectedPaths })
};
```

### 強化安全性

為了確保開發者不會繞過框架直接使用原生訊息 API，專案配置了嚴格的 ESLint 規則：

```javascript
"no-restricted-syntax": [
  "error",
  {
    selector: "CallExpression[callee.property.name='postMessage']",
    message: "請使用 @/utils/message_client.ts 或 @/utils/message_host.ts 處理訊息發送。",
  },
  {
    selector: "CallExpression[callee.property.name='onDidReceiveMessage']",
    message: "請使用 @/utils/message_host.ts 中的訊息處理機制。",
  },
  {
    selector: "CallExpression[callee.property.name='addEventListener'][arguments.0.value='message']",
    message: "請使用 @/utils/message_client.ts 中的訊息處理機制。",
  },
]
```

這些規則禁止直接呼叫 `postMessage`、`onDidReceiveMessage` 與 `addEventListener('message', ...)`，強制所有訊息通訊都必須透過框架提供的包裝函數。

同時，利用 TypeScript 的型別系統，框架要求在使用 `invoke`、`onDidReceiveInvoke` 等函數時，必須明確指定泛型參數（預設為 `never`），這樣若開發者忘記帶入正確的 API 型別，輸入 id 時就會產生型別錯誤，避免誤用：

```typescript
invoke("someUnknownId", {}); // 錯誤：無法將類型 'string' 分配給類型 'never'
```

這種「編譯時防護」確保了即使在團隊協作或長期維護中，也不會因為疏忽或不熟悉而破壞框架的一致性。所有訊息都遵循統一的格式與流程，讓程式碼審查與除錯變得更加容易。

### 初始資料注入

作為使用過全端框架的人，想必已經很熟悉了 SSR 的概念，然而到了像是 Electron 或者這次的 VSCode 這種本地雙環境時，似乎就沒有太多人在意。但實際上，在本地雙環境中，其實應該更容易實現：

```
使用者觸發開啟 webview 的 command
  ↓ command callback 呼叫 handler 準備初始資料
  ↓ handler 執行同步或非同步邏輯（如讀取檔案系統）
  ↓ 將結果序列化為 JSON 字串（經過 XSS 防護處理）
  ↓ 注入到 HTML 模板的 <script id="__data__"> 標籤中
  ↓ 設定 webview.html，VSCode 渲染 webview
前端 React 應用啟動
  ↓ 呼叫 getInitialData<T>() 讀取 __data__ 標籤內容
  ↓ 解析 JSON 並返回型別化的資料
  ↓ 直接放入 Zustand 狀態管理
  ↓ React 元件在首次渲染時已有資料，無閃爍
```

這個流程的精髓在於「資料與 HTML 同時抵達」。傳統的 SPA 應用需要先載入空殼 HTML、再透過 JavaScript 請求資料，這會導致明顯的載入延遲。而初始資料注入技術類似於 SSR（Server-Side Rendering），讓首次渲染就能顯示有意義的內容。

# 3. 架構設計

## 四層架構的由來與定義

面對擴展插件的複雜性，傳統的架構往往顯得不夠貼合 VSCode 擴展開發的實際需求。這些經典模式過度抽象，為了「通用性」而引入過多層次，反而讓簡單的需求變得繁瑣。本專案選擇自行設計一套四層架構，其核心理念是**透過擴展名詞的語義範圍，實現更扁平、更彈性的結構**。

這四層分別是 **Commands**、**Providers**、**Handlers** 與 **Webviews**，其中前三層運行於延伸主機（Node.js 環境），最後一層運行於 Webview（瀏覽器環境）。每層都有明確的職責邊界，但又透過「廣義定義」獲得了足夠的表達能力，避免了過度分層的弊病。

### Commands：廣義的全域事件監聽

在 VSCode API 中，`vscode.commands.registerCommand` 是註冊命令的標準方式。但本架構將 **Commands** 的概念擴展為「任意全域事件的監聽層」，而非狹義的命令註冊。

這個擴展基於一個觀察：命令本質上也是一種事件監聽。當使用者透過命令面板、右鍵選單或快捷鍵觸發某個 command 時，延伸主機收到的就是一個「命令被呼叫」的事件。既然如此，為何不將所有全域事件監聽都納入同一層管理？

因此，Commands 層不僅處理 `registerCommand`，也處理諸如 `vscode.window.onDidChangeActiveTextEditor`、`vscode.workspace.onDidChangeConfiguration` 等生命週期事件。這些事件的共同特徵是：它們都是「外部觸發、全域性、需要註冊監聽器」的行為。

### Providers：廣義的延伸主機 UI 管理

傳統上，`Provider` 是 VSCode API 中的特定概念，例如 `TreeDataProvider`、`CompletionItemProvider` 等，用於實現特定類型的 UI 功能。但本架構將 **Providers** 擴展為「任意在延伸主機層級的全域 UI 管理」，遠超出 VSCode 官方定義的範疇。

這個擴展同樣基於語義的觀察：所有這些 UI 相關操作（無論是實現一個 TreeView、建立一個 Webview Panel、為 Webview 與延伸主機建立溝通、還是更新 StatusBar）的共同特徵是：它們都涉及長時間的生命週期或者是需要在插件啟用下持續追蹤的。

因此，Providers 層包含但不限於：

- **官方 Provider**：如 `CustomEditorProvider` 的實作（圖片檢視器功能）
- **Webview Panel 管理**：建立、配置、銷毀 webview 面板
- **StatusBar 操作**：更新狀態列顯示（檔案元資料功能）
- **API 定義與監聽註冊**：定義延伸主機端有哪些可呼叫的處理函數，並實際註冊訊息監聽器

### Handlers：無狀態的處理流程

Handlers 層是整個架構中最純粹的一層，其定義非常直接：**所有可以提供給 Commands、Providers 使用的處理器函數**。

這些函數都遵循「無狀態」的原則：它們不依賴外部狀態、不保存內部狀態、不產生副作用（除了預期的 I/O 操作）。每次呼叫都是獨立的：帶入參數、進入流程、返回結果、結束。然而他們並不是實際意義上的「純函數」，因為他們仍可以提供「流程控制」的能力，比如使用 `vscode.window.quickPick` 來與使用者互動，或者使用 `vscode.window.withProgress` 來顯示進度等。

而 Providers 則會負責協調這些 Handlers，透過 TypeScript 的型別導出定義了「延伸主機端有哪些可呼叫的 API」

```typescript
type ReadDirAPI = { id: "readDirectory"; handler: typeof handleReadDirectory };
type CreateFileAPI = { id: "createFile"; handler: typeof handleCreateFile };
// ...
export type { ReadDirAPI, CreateFileAPI /* ... */ };
```

這些型別定義會被前端導入（透過 `import type`），用於 `invoke` 呼叫時的型別參數。這形成了一個清晰的契約：Providers 定義介面、Handlers 實作邏輯、Webviews 呼叫服務。

### Webviews：前端應用的載體

Webviews 層是架構中唯一運行於瀏覽器環境的部分，其定義是：**任意在 panel.webview 中實際使用的前端程式碼**。若插件中的某個功能需要 webview，這裡就會有對應的 React 應用存在。

這一層的職責包括：

- **UI 呈現**：使用 React + Material-UI 構建使用者介面
- **狀態管理**：透過 Zustand 維護前端狀態
- **事件處理**：響應使用者互動（點擊、輸入等）
- **通訊協調**：透過 `invoke` 呼叫延伸主機 API、透過 `onReceiveCommand` 接收命令轉發

# 4. 資料流


有了對於訊息框架與四層架構的理解後，我們可以透過具體的範例來觀察資料如何在各層之間流動。

## 場景一：使用者開啟檔案系統瀏覽器

```
使用者在檔案總管右鍵點擊資料夾，選擇「以檔案系統瀏覽器顯示」
  ↓ VSCode 觸發 command: "1ureka.openFileSystemFromExplorer"
[Commands] registerFileSystemCommands 中的回調被執行
  ↓ 驗證 uri 參數有效性
  ↓ 呼叫 fileSystemProvider.createPanel(uri.fsPath)
[Providers] FileSystemPanelProvider.createPanel 執行
  ↓ 呼叫 handleInitialData({ dirPath })
[Handlers] handleInitialData 返回基本的路徑資訊（不讀取檔案）
  ↓ 返回到 Providers 層
[Providers] 使用 initialData 建立 webview panel
  ↓ 將 initialData 序列化並注入 HTML <script> 標籤
  ↓ 註冊訊息監聽器（onDidReceiveInvoke）
  ↓ 設定 panel.webview.html
[Webviews] React 應用載入並執行
  ↓ getInitialData() 讀取 <script> 標籤內容
  ↓ fileSystemDataStore 初始化（包含路徑資訊，但 entries 為空）
  ↓ React 元件立即渲染骨架畫面
  ↓ 透過 requestQueue 呼叫 invoke<ReadDirAPI>("readDirectory", { dirPath })
[Providers] onDidReceiveInvoke 接收到訊息
  ↓ 呼叫 handleReadDirectory({ dirPath })
[Handlers] handleReadDirectory 執行
  ↓ 實際讀取檔案系統（readDirectory）
  ↓ 統計數量、檢視詳細資訊（inspectDirectory）
  ↓ 返回 ReadDirectoryResult
[Providers] onDidReceiveInvoke 發送回前端
[Webviews] invoke 的 Promise resolve
  ↓ fileSystemDataStore.setState({ ...result }) 更新狀態
  ↓ React 元件重新渲染，顯示檔案列表
```

這個流程展現了完整的初始化過程。關鍵在於「兩階段載入」：第一階段透過 `initialData` 注入基本資訊，讓 webview 能立即顯示骨架畫面（路徑、麵包屑等），避免白屏；第二階段透過 `invoke` 請求實際資料，填充檔案列表。這種設計在視覺上提供了漸進式載入的流暢體驗。

## 場景二：使用者在 webview 中點擊資料夾

```
使用者點擊某個資料夾名稱
  ↓ onClick 事件觸發
[Webviews] 表格元件呼叫 navigateToFolder({ dirPath: clickedFolderPath })
  ↓ navigateToFolder 將請求加入 requestQueue
  ↓ requestQueue 呼叫 invoke<ReadDirAPI>("readDirectory", { dirPath })
  ↓ requestQueue 設定 loading 為 true
[Providers] onDidReceiveInvoke 接收訊息
  ↓ 呼叫 handleReadDirectory({ dirPath })
[Handlers] 執行檔案讀取與處理邏輯
  ↓ 返回結果
[Providers] onDidReceiveInvoke 發送結果
[Webviews] invoke Promise resolve
  ↓ requestQueue 設定 loading 為 false
  ↓ fileSystemDataStore.setState({ ...result }) 更新資料
  ↓ fileSystemViewStore 訂閱觸發，呼叫 handleDataUpdate()
  ↓ handleDataUpdate 執行篩選、排序、附加圖示
  ↓ fileSystemViewDataStore.setState({ entries, selected }) 更新檢視資料
  ↓ React 元件訂閱 viewDataStore，重新渲染新的檔案列表
```

這個流程展現了「請求佇列」與「依賴鏈自動更新」的機制。`requestQueue` 確保即使使用者快速點擊多個資料夾，請求也會依序執行，不會出現「回應 B 先到達、覆蓋回應 A」的競態問題。同時，`loading` 狀態完全由佇列管理，只要佇列中有待處理請求，loading 就為 true，確保了指示器的正確顯示。

## 場景三：使用者在 webview 右鍵選單點擊「重新整理」

```
使用者在 webview 上按右鍵，選擇「重新整理」
  ↓ VSCode 觸發 command: "1ureka.fileSystem.refresh"
[Commands] registerFileSystemCommands 中的回調執行
  ↓ 獲取當前面板（panelManager.getCurrent()）
  ↓ 呼叫 forwardCommandToWebview<ReadDirAPI>(panel, "readDirectory")
[Providers] forwardCommandToWebview 發送 ForwardCommandMessage
[Webviews] onReceiveCommand<ReadDirAPI>("readDirectory", handleRefresh) 接收訊息
  ↓ handleRefresh 執行
  ↓ 讀取 fileSystemDataStore.getState().currentPath
  ↓ 呼叫 navigateToFolder({ dirPath: currentPath })
  ↓ （後續流程同場景二）
```

這個流程展現了「命令轉發」的完整機制。由於右鍵命令在延伸主機觸發，無法直接知道前端的當前路徑，因此需要轉發到前端、由前端讀取自身狀態（`currentPath`）、再透過 `invoke` 發起請求。這種雙跳機制雖然增加了一次通訊，卻換來了清晰的職責分離與可維護性。

---

作者：1ureka | 版本：0.4.0
