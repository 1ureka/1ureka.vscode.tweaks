# 1ureka's VSCode Extension

個人使用的 VSCode 擴充套件，整合多種實用功能。

# 1. 主要功能

- 提供閃光圖示按鈕在 explorer 面板與 editor 面板右上角，無縫整合進 VSCode 介面、非常省空間同時易於存取
- 按下後，會開啟快速前往選單，列出擴展中的大部分功能，同時利用圖示與文字排版來避免 overwhelm 使用者

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
- 提供不同布局模式與不同尺寸等偏好設定，可在右鍵選單即時切換
- 預設的瀑布流佈局，完美適應當資料夾中有各種尺寸比例圖片時的情況
- 響應式設計，無論面板如何分割或調整大小，都能正確排版並顯示圖片
- 漸進式載入機制，先快速掃描所有圖片的元資料，顯示骨架與排版，確保初始畫面無閃爍
- 自動壓縮圖片，經過測試在 50 張圖片且每張圖片都超過 50MB 也能高效顯示且不影響滾動體驗
- 分頁機制與快速元資料讀取，支援上達數千張圖片的資料夾
- 點擊圖片即可在圖片檢視器中開啟

## 圖片剪貼簿

- 在圖片檢視器右鍵選單有複製該張圖片的選項
- 在圖片牆右鍵任一圖片的選單中也有複製該張圖片的選項
- 在 Windows 系統上，複製的是圖片二進位資料而非單純路徑，包括 Windows 原生無法直接寫入的 WebP、TIFF 等格式
- 複製大型圖片時顯示實時進度，提供即時回饋

## 檔案元資料顯示

- 狀態列自動顯示當前檔案的建立時間、修改時間、大小等資訊
- 支援所有檔案類型，甚至包括 VsCode 原生無法開啟的任意二進位檔
- 適合管理包含非程式碼檔案的專案
- 針對圖片檔案提供特殊 UI，額外顯示解析度、長寬比、格式、色彩空間、通道等資訊

## 系統瀏覽器

- 右鍵資料夾「以系統瀏覽器顯示」，或使用命令面板「開啟系統瀏覽器」瀏覽任意位置的檔案
- 類似作業系統的檔案總管，但使用仿雲端硬碟的現代化介面，目標是再也不需要打開系統檔案總管
- 讓 VsCode 能夠更輕鬆的與外部互動，比如將下載資料夾中的檔案移動到工作區中
- 實現完整路由，包括瀏覽資料夾、回到上層、麵包屑導航、開啟檔案並顯示在 VsCode 編輯器、快速前往(Go to)等
- 採用虛擬化技術，即使資料夾包含數萬個檔案，也能維持原生檔案總管的效能表現
- 支援完整的表格操作，依指定欄位排序、切換升冪/降冪、篩選、選取等
- 支援完整的選取功能，包括單擊選取、Ctrl / Cmd 多選、Shift 範圍選取、全選、反選等
- 支援高效能的框選體驗，利用了不使用 React 狀態管理、採用原生事件、`requestAnimationFrame`、以及虛擬化帶來的純數學計算等方式等
- 框選時，會在靠近邊緣時有非線性加速滾動，在大量檔案時也能精準選取的同時，提供更自然的滾動體驗
- 剪貼簿採用內部狀態，確保沙盒安全性，並且不採取傳統的複製與剪下，而是一個[更符合現代的設計](#系統瀏覽器剪貼簿)
- 當真的發生檔案操作錯誤時，會產生詳細的錯誤報告，說明哪些檔案操作失敗、失敗原因
- 透過研究與分析 `fs-extra` 的行為與可能的競態條件，錯誤報告還分別在不同錯誤時，提供了完整的副作用/影響說明，確保錯誤是透明且可理解的
- 對常用的 150+ 檔案類型提供自訂圖示，避免直接顯示附檔名，全面採用直覺易懂的檔案類型描述
- 使用單一佇列系統處理所有 IO 非同步請求，避免競態條件並確保操作順序一致
- 從佇列系統中衍生出可靠的全域載入狀態指示，同時對於快速完成的操作顯示避免顯示，杜絕閃爍
- 載入指示採非侵入式設計，在下方以細長進度條顯示，使用者仍可繼續操作介面
- 透過研究 VSCode 源碼，實現與檔案拖曳，支援將檔案從系統瀏覽器拖動到 VSCode 編輯器、 VSCode 檔案總管、原生作業系統檔案總管等
- 提供常用的檔案操作按鈕（新增資料夾、新增檔案等）
- 「在此開啟...」功能組，提供快速在當前路徑開啟新工作區、終端機或是該插件的圖片牆等

## 系統瀏覽器剪貼簿

- 在傳統介面中，「剪下」（Cut）和「複製」（Copy）在寫入剪貼簿時被區分開來，這延續了電腦還都是文字時的行為
- 然而，對於現代檔案系統而言，兩者在「寫入」階段的操作本質是相同的——都只是儲存檔案的參考，並不會立即刪除原始檔案
- 為了提供更直覺、更靈活的使用者體驗，本專案採用以下設計：
  - 統一寫入操作： 剪貼簿操作統一為「寫入剪貼簿」，不區分複製或剪下
  - 延後決策： 唯一的差異只在於「貼上」時的最終行為
  - 直覺化命名： 使用者在貼上時，介面會詢問是執行「複製」還是「移動」
- 使用者可以隨時在「複製」和「移動」之間切換意圖
- 避免了傳統介面中，如果最初選擇錯誤（例如選了複製，但後來想移動），必須返回原始資料夾重新操作的麻煩，從而大幅簡化了操作流程
- 移動也比起 "剪下 + 貼上" 更直覺，因為剪下並不算是一種口語化的動作描述
- 同時由於不需區分剪下與複製，寫入剪貼簿的項目也提供簡潔又直覺的視覺回饋

## 自訂樣式注入

- 比起 `Custom JS and CSS Loader` 能更安全注入自訂 CSS 到 VSCode 介面
- 透過採用修改而非刪除 CSP 的策略，通過安全完整性檢查
- 以及建構插件時將 CSS 內聯為字串，消除執行時的檔案 I/O 也減少了安全風險

## 外部應用程式整合 (Windows)

- 右鍵 `.blend` 檔案快速以裝置中最新的 Blender 開啟
- 右鍵 `.spp` 檔案快速以裝置中最新的 Substance Painter 開啟
- 右鍵 `.html` 檔案快速以預設瀏覽器開啟
- 命令選擇區也可直接啟動 Substance Painter 或 Blender
- 若應用位置特殊或想指定版本，可在 VsCode 設定中自訂路徑

---

# 2. 訊息通訊的種類與挑戰

在 VSCode 擴展開發中，延伸主機（Node.js 環境）與 Webview（瀏覽器環境）之間存在著嚴格的環境隔離。兩者無法直接共享記憶體或呼叫彼此的函數，所有通訊都必須透過訊息傳遞機制實現。然而，這種機制所帶來的複雜性遠超表面所見。

第一個挑戰是 **型別與結構的一致性**。若僅依賴斷言，型別檢查過於寬鬆；若使用集中式的註冊表，可確保型別安全，卻又把所有 API 綁在單一物件上，使不同功能彼此耦合。此外，這些方案多半假設功能只存在於延伸主機，然而實際上，由於有第二個挑戰的存在，單純的「前端 → 主機」模型無法涵蓋全部需求。

第二個挑戰則來自 **VSCode 右鍵選單的特殊性**。Webview 本身並不是一般的前端應用，它無法像傳統網頁那樣攔截或自訂瀏覽器的 `contextmenu` 行為。因此，當使用者在 Webview 的畫面上按右鍵並選擇某個選項時，真正被觸發的其實是 **延伸主機端的 command**

此時，command 回調函數無法直接存取 webview 的當前狀態（如使用者選取了哪些項目）。這導致需要一種 **轉發機制**，延伸主機先通知前端「使用者意圖」，前端根據自身狀態準備完整參數後，再透過正常的請求流程回傳給延伸主機處理（如將選取的檔案刪除）。

甚至有些原本設想用右鍵選單觸發的功能，本質上其實完全屬於前端邏輯，只是因為 VSCode 的限制才必須透過延伸主機轉發。

綜合以上挑戰，一個擴展插件至少需要處理三種核心訊息類型：

1. **前端請求 (Invoke)**：前端呼叫延伸主機的 handler，需要等待結果並確保型別安全
2. **命令轉發 (Forward)**：延伸主機把 command 訊息轉發給前端，由前端依據自身狀態組合參數並進行 Invoke，或直接觸發前端邏輯
3. **初始資料注入 (Initial Data)**：在 Webview 生成 HTML 時直接注入資料，避免 Webview 載入時的閃爍與延遲

---

# 3. 訊息框架設計

面對上述複雜性，似乎沒有現有方案能夠完全滿足需求，因此本專案選擇自行實現一套訊息框架。由於 VSCode 右鍵選單的特殊性，所以功能或者說 API，其實可能存在於延伸主機端，也可能存在於前端，因此框架先從以下的一個核心概念出發：

```typescript
type API = {
  id: string;
  handler: (params: any) => any | Promise<any>;
};
```

這個 `API` 型別定義了一個「處理函數」的抽象概念，它只包含兩個屬性：唯一識別碼 `id` 與實際處理邏輯 `handler`。關鍵在於，這個型別定義完全不依賴任何執行環境，既不需要 VSCode API、也不需要瀏覽器 API。它只是一個純粹的 TypeScript 型別，可以代表任何環境中的 handler，同時可以在任何環境中被導入並作為泛型參數使用。

比如說：

```typescript
// 延伸主機端定義的 API
type ReadDirAPI = { id: "readDirectory"; handler: typeof handleReadDirectory };
// 前端可以直接用型別導入這個定義，並套用到下個章節中介紹的泛型函數
import type { ReadDirAPI } from "@/providers/fileSystemProvider";
```

或反之

```typescript
// 前端定義的 API
type SetLayoutLargeAPI = { id: "setLayoutLarge"; handler: typeof handleSetLayoutLarge };
// 延伸主機可以直接用型別導入這個定義，並套用到下個章節中介紹的泛型函數
import type { SetLayoutLargeAPI } from "@/webviews/imageWall/layoutActions";
```

## 獨立的訊息通道與架構

傳統的訊息框架往往採用「集中式註冊」的設計模式，例如維護一個 `apiMap` 或 `apiRecord` 物件，將所有 API 的 id 與 handler 對應關係集中管理。這種做法看似清晰，實則帶來了耦合性問題：每次新增 API 都需要修改這個中央註冊表，所有 API 的生命週期被綁定在一起。

本框架採用完全相反的策略：**每個 API 的註冊與監聽都是獨立的**，唯一的連接點是 `id` 字串與型別定義。

### Invoke (請求-回應)

在 `message_host.ts` 中，提供給延伸主機 `onDidReceiveInvoke` 函數，用於註冊處理前端請求的 handler：

```typescript
function onDidReceiveInvoke<T extends API = never>(panel: vscode.WebviewPanel, id: T["id"], handler: T["handler"]) {
  const disposable = panel.webview.onDidReceiveMessage(async (message) => {
    const { type, requestId, handlerId, params } = message as InvokeMessage;

    if (type === "invoke" && handlerId === id) {
      const result = await handler(params);
      const responseMessage: InvokeResponseMessage = { type: "invoke.response", requestId, handlerId: id, result };

      panel.webview.postMessage(responseMessage);
    }
  });

  panel.onDidDispose(() => disposable.dispose());
}
```

在 `message_client.ts` 中，提供給前端 `invoke` 函數，用於呼叫延伸主機的 handler 並等待回應：

```typescript
function invoke<T extends API = never>(id: T["id"], params: Parameters<T["handler"]>[0]): Promised<T["handler"]> {
  const { promise, resolve } = defer<Awaited<ReturnType<T["handler"]>>>();
  const requestId = crypto.randomUUID();

  const message: InvokeMessage = { type: "invoke", requestId, handlerId: id, params };
  vscode.postMessage(message);

  const handleMessage = (event: MessageEvent<InvokeResponseMessage>) => {
    const message = event.data;
    if (message.type === "invoke.response" && message.requestId === requestId && message.handlerId === id) {
      window.removeEventListener("message", handleMessage);
      resolve(message.result);
    }
  };

  window.addEventListener("message", handleMessage);
  return promise;
}
```

當然，除了解決耦合性問題， VSCode 右鍵選單的特殊性仍然存在，因此我們需要一個專門的通道來處理命令轉發，但同時也擁有與 invoke 相同的型別安全與獨立性保障。

### Forward (命令轉發/意圖)

在 `message_host.ts` 中，提供給延伸主機 `forwardCommandToWebview` 函數，用於將命令轉發給前端：

```typescript
function forwardCommandToWebview<T extends API = never>(panel: vscode.WebviewPanel, action: T["id"]) {
  const message: ForwardCommandMessage = { type: "command", action };
  panel.webview.postMessage(message);
}
```

注意到其並不需要在呼叫時提供任何參數，因為後端不保有任何狀態，該通道也是為了解決這種「延伸主機無法存取前端狀態」的問題。

在 `message_client.ts` 中，提供給前端 `onReceiveCommand` 函數，用於接收延伸主機轉發的命令：

```typescript
function onReceiveCommand<T extends API = never>(id: T["id"], handler: () => void) {
  const handleMessage = (event: MessageEvent<ForwardCommandMessage>) => {
    const message = event.data;
    if (message.type === "command" && message.action === id) handler();
  };
  window.addEventListener("message", handleMessage);
}
```

## 開放封閉原則

透過以上的兩個設計，實現了每個訊息的發送與接收都是獨立的，互不干擾，且都享有相同的型別安全保證。並且 `API` 型別的設計使得該框架與環境無關，不論是前端還是延伸主機，都可以自由定義自己的 API，並且可以導入對方的 API 定義，只要帶入正確的泛型參數即可。

這種架構的優勢在於其實現了開放封閉原則：新增一個功能模組時，只需定義自己的 API 型別、註冊自己的 handler、在前端呼叫自己的 invoke，完全不需要了解其他模組的實作。這種「按需註冊、互不干擾」的模式，讓專案能夠水平擴展而不增加複雜度。

## 強化安全性

為了確保開發者不會繞過框架直接使用原生訊息 API，專案配置了嚴格的 ESLint 規則，比如：

```javascript
CallExpression[callee.property.name='postMessage']
CallExpression[callee.property.name='onDidReceiveMessage']
CallExpression[callee.property.name='addEventListener'][arguments.0.value='message']
```

這些規則禁止直接呼叫 `postMessage`、`onDidReceiveMessage` 與 `addEventListener('message', ...)`，強制所有訊息通訊都必須透過框架提供的包裝函數。

同時，利用 TypeScript 的型別系統，預設泛型為 `never`，這樣若開發者忘記帶入正確的 API 型別，輸入 id 時就會產生型別錯誤，避免誤用：

```typescript
invoke("id", {...}); // 錯誤：無法將類型 'string' 分配給類型 'never'
```

這種「編譯時防護」確保了即使在團隊協作或長期維護中，也不會因為疏忽或不熟悉而破壞框架的一致性。所有訊息都遵循統一的格式與流程，讓程式碼審查與除錯變得更加容易。

---

# 4. 架構設計

面對擴展插件的複雜性，我認為 VSCode 原本的擴展架構與名詞模式過度抽象，為了通用性或技術準確性而引入過多層次，反而讓簡單的需求變得繁瑣。

因此，本專案選擇自行設計一套四層架構，其核心理念是**透過擴展原本名詞的語義範圍，實現更扁平、更彈性的結構**。

## Commands

**定位**：所有「在 VSCode 全域觸發、需註冊監聽」的事件來源

**涵蓋範圍**：

- VSCode commands (`registerCommand`)，因命令本質上也可視作一種「全域事件」
- 編輯器焦點切換（`onDidChangeActiveTextEditor`）
- 設定變更（`onDidChangeConfiguration`）
- 其他全域的事件監聽綁定
- 若命令與 Webview 高度相關，比如註冊在 `webview/context` 中的命令，可以使用 `forwardCommandToWebview`

## Providers

**定位**：所有「需要持續或長時間存在、管理、協調」的延伸主機視圖 (View) 與前後端溝通協調

**涵蓋範圍**：

- 官方 Provider（如 `CustomEditorProvider`）
- Webview Panel 建立、追蹤、銷毀
- StatusBar 生命週期管理
- 當有 Webview 需求時，將 Handlers 的處理函數包裝為 API，以及使用 `onDidReceiveInvoke`

## Handlers

**定位**：所有可被 Commands / Providers 呼叫的「無狀態」處理函數，可以是純函數，也可以是帶有流程控制的非同步函數

**涵蓋範圍**：

- 單純接收參數 → 使用 nodeJS 模組 → 回傳結果的純函數
- 需要與使用者互動（`vscode.window.showQuickPick`）或顯示進度（`vscode.window.withProgress`）的非同步函數
- 用 `fs`、`path` 等模組進行檔案系統操作的函數
- 處理圖片（`sharp`）等二進位檔案的函數
- 關鍵在於與專案的訊息框架無關

## Webviews

**定位**：在瀏覽器環境中執行的前端應用，但不是每個功能都會用到，只有需要 Webview 的功能才會有這一層

**涵蓋範圍**：

- 使用 React 構建使用者介面
- 透過 Zustand 維護狀態
- 響應使用者互動事件（點擊、輸入等）
- 需要時透過 `invoke` 呼叫延伸主機 API、透過 `onReceiveCommand` 接收命令轉發

---

# 5. 資料流

有了訊息框架與四層架構，我們可以透過具體的範例來觀察資料如何在各層之間流動。

## 場景一：使用者開啟系統瀏覽器

| 層級      | 動作                                                                                                                    |
| --------- | ----------------------------------------------------------------------------------------------------------------------- |
| 使用者    | 使用者在 VSCode 的檔案總管面板右鍵點擊資料夾，選擇「以系統瀏覽器顯示」                                                  |
| Commands  | VSCode 觸發對應命令，其回調被執行 → 呼叫 `fileSystemProvider.createPanel`                                               |
| Providers | 呼叫 `handleInitialData(/* ... */)`                                                                                     |
| Handlers  | 快速讀取一些基本的路徑資訊                                                                                              |
| Providers | 將初始資料序列化並注入 HTML → 註冊 `onDidReceiveInvoke<ReadDirAPI>` → 設定 `panel.webview.html`                         |
| Webviews  | 讀取初始資料放入 zustand 狀態 → React 立即渲染骨架畫面，React 外部同時呼叫 `invoke<ReadDirAPI>(/* ... */)` 獲取詳細資訊 |
| Providers | `onDidReceiveInvoke<ReadDirAPI>` 接收到訊息 → 呼叫 `handleReadDirectory`                                                |
| Handlers  | 讀取該目錄的詳細資訊                                                                                                    |
| Providers | `onDidReceiveInvoke<ReadDirAPI>` 發送回前端                                                                             |
| Webviews  | `invoke` 的 Promise resolve → `store.setState({ ...result })` → React 自動重新渲染                                      |

這個流程展現了完整的初始化過程。第一階段透過注入基本資訊，讓 webview 能立即顯示骨架畫面；第二階段透過 `invoke` 請求詳細資料，填充檔案列表。這種設計在視覺上提供了漸進式載入的流暢體驗。

## 場景二：使用者在 webview 中點擊資料夾

| 層級      | 動作                                                                               |
| --------- | ---------------------------------------------------------------------------------- |
| 使用者    | 使用者點擊某個資料夾                                                               |
| Webviews  | onClick 事件觸發 → 呼叫 `invoke<ReadDirAPI>(/* ... */)`                            |
| Providers | `onDidReceiveInvoke<ReadDirAPI>` 接收訊息 → 呼叫 `handleReadDirectory`             |
| Handlers  | 執行檔案讀取與處理邏輯 → 返回結果                                                  |
| Providers | `onDidReceiveInvoke<ReadDirAPI>` 發送結果                                          |
| Webviews  | `invoke` 的 Promise resolve → `store.setState({ ...result })` → React 自動重新渲染 |

這個流程展現了典型的前端請求-回應模式。使用者互動直接觸發 `invoke`，延伸主機處理請求並返回結果，前端更新狀態並重新渲染畫面。

## 場景三：使用者在 webview 右鍵選單點擊「重新整理」

| 層級     | 動作                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 使用者   | 使用者在 webview 上按右鍵,選擇「重新整理」                                                                                           |
| Commands | VSCode 觸發該右鍵選單選項綁定的命令 → 命令的回調執行 → 獲取當前面板並呼叫 `forwardCommandToWebview<ReadDirAPI>(/* ... */)`           |
| Webviews | `onReceiveCommand<ReadDirAPI>` 接收訊息 → 讀取 `store.getState().currentPath` → `invoke<ReadDirAPI>(/* ... */)` → (後續流程同場景二) |

這個流程展現了「命令轉發」的完整機制。由於右鍵命令在延伸主機觸發，無法直接知道前端的當前路徑，因此需要轉發到前端、由前端讀取自身狀態（`currentPath`）、再透過 `invoke` 發起請求。

---

作者：1ureka | 版本：0.4.9
