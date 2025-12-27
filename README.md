# 1ureka's VSCode Extension

個人使用的 VSCode 擴充套件，整合多種實用功能，希望讓 VSCode 超越 IDE，成為全方位的 "本地瀏覽器"。

---

# 架構設計

面對擴展插件的複雜性，我認為 VSCode 原本的擴展架構與名詞模式過度抽象，為了通用性或技術準確性而引入過多層次，反而讓簡單的需求變得繁瑣。

因此，本專案選擇自行設計一套四層架構，其核心理念是**透過擴展原本名詞的語義範圍，實現更扁平、更彈性的結構**。

## Commands

**定位**：所有「在 VSCode 全域觸發、需註冊監聽」的事件來源

**涵蓋範圍**：

- VSCode commands (`registerCommand`)，因命令本質上也可視作一種「全域事件」
- 編輯器焦點切換（`onDidChangeActiveTextEditor`）
- 設定變更（`onDidChangeConfiguration`）
- 其他全域的事件監聽綁定

## Providers

**定位**：所有「需要持續或長時間存在、管理、協調」的延伸主機視圖 (View) 與前後端溝通協調

**涵蓋範圍**：

- 官方 Provider（如 `CustomEditorProvider`）
- Webview Panel 建立、追蹤、銷毀
- StatusBar 生命週期管理
- 當有 Webview 需求時，將 Handlers 的處理函數包裝為 API，以及使用 `registerInvokeEvents`
- 為 Handlers 提供流程依賴注入，比如將 `vscode.window.showQuickPick` 作為 `getActionType` 參數傳入

## Handlers

**定位**：所有可被 Commands / Providers 呼叫的「無狀態」處理函數，可以是純函數，也可以是帶有 IO 的非同步函數

**涵蓋範圍**：

- 單純接收參數 → 使用 nodeJS 模組 → 回傳結果的純函數
- 用 `fs`、`path` 等模組進行檔案系統操作的非同步函數
- 處理圖片（`sharp`）等二進位檔案的非同步函數
- 若是流程式的，則會在簽名中帶有 `getInput`、`getActionType` 等 `() => Promise<any>` 的依賴需求，由 Providers 注入

## Webviews

**定位**：在瀏覽器環境中執行的前端應用，但不是每個功能都會用到，只有需要 Webview 的功能才會有這一層

**涵蓋範圍**：

- 使用 React 構建使用者介面
- 透過 Zustand 維護狀態
- 響應使用者互動事件（點擊、輸入等）
- 需要時透過 `invoke` 呼叫延伸主機 API

---

# 本地資源的深度整合

VSCode 的工作區域與檔案總管樹狀檢視雖然很方便，但當要與本地的其他資源互動時，比如想將下載的資源導入到專案中，或是想開啟圖片資料夾的參考檔案，只能跳脫 VSCode 的視窗，使用系統的檔案總管來操作，這樣就失去了在 VSCode 中一站式管理的便利性。

因此，本擴展提供了一個**系統瀏覽器**的功能，讓使用者可以直接在 VSCode 中瀏覽、管理本地檔案系統中的任意資料夾，除了包含了一個完整的檔案總管功能，比如檔案/資料夾的建立、刪除、重新命名、拖曳移動、書籤管理、歷史紀錄、篩選與排序、磁碟機元資料、資料夾大小等，還特別針對圖片資料夾提供了**網格檢視模式**，可以透過瀑布流佈局直觀地瀏覽圖片縮圖，快速參考多媒體資源。

## 架構

系統瀏覽器採用三層架構，核心理念是**以狀態為中心的單向數據流**，各層職責清晰分離：

### Store

**定位**：應用程式的唯一真實來源（Single Source of Truth），負責管理所有可觀測的狀態

**職責範疇**：

1. **狀態定義與容器化**：將應用程式所需的所有狀態（如使用者輸入、伺服器資料、UI 狀態等）封裝為可訂閱的容器，對外提供讀取接口
2. **依賴鏈管理**：定義狀態之間的訂閱關係與計算邏輯，當某個狀態變更時，自動觸發依賴它的其他狀態進行同步更新，確保整個更新過程的原子性
3. **非同步協調**：管理與後端的異步互動（請求佇列、載入狀態追蹤），避免併發請求造成的資料競態與不一致
4. **資源快取**：對需要延遲載入或昂貴計算的資源（如圖片、大型資料）提供記憶化與快取策略
5. **初始化與通訊**：建立應用程式啟動時的初始狀態，並提供與延伸主機通訊的介面

**核心特性**：狀態容器對 UI 來說是唯讀的，所有變更必須透過 Action 層觸發，由依賴鏈自動傳播，實現「狀態改變即連鎖反應」的響應式更新

### Action

**定位**：封裝所有業務邏輯與狀態變更操作，作為任意觸發源與 Store 之間的唯一橋樑

**職責範疇**：

1. **狀態變更邏輯**：提供改變 Store 中狀態的純函數或異步函數，這些函數接收參數、執行計算或副作用、最後更新狀態
2. **後端協調**：透過請求佇列向延伸主機發起 API 調用，並在收到回應後更新對應的狀態
3. **使用者互動處理**：封裝來自 UI 事件（點擊、拖曳、鍵盤輸入等）的處理邏輯，將原生事件轉換為狀態變更
4. **全域行為綁定**：統一管理快捷鍵、右鍵選單等全域行為的註冊與處理

**核心特性**：Action 不持有狀態，僅作為狀態轉換的「動詞」存在，可被任意來源調用（UI 元件、快捷鍵、後端推送、定時器等），保證邏輯的可重用性與可測試性

### UI

**定位**：訂閱 Store 並根據狀態渲染使用者介面，將使用者的互動行為委派給 Action

**職責範疇**：

1. **狀態訂閱與渲染**：透過細粒度訂閱機制從 Store 讀取所需的狀態切片，並在狀態變更時自動重新渲染對應的 UI 區域
2. **事件委派**：將使用者的互動行為（按鈕點擊、輸入、拖曳等）轉發給對應的 Action，自身不包含任何業務邏輯
3. **佈局與組合**：透過元件的巢狀與組合，構建出完整的使用者介面，包含可複用的基礎元件與特定場景的佈局元件
4. **效能優化**：實作虛擬滾動、懶載入、Suspense 等技術，在大量資料或複雜互動場景下維持流暢的使用者體驗

**核心特性**：UI 元件是純粹的「狀態呈現器」，所有資料來自 Store，所有行為委派給 Action

## 原子化依賴鏈

在複雜的狀態管理中，某個狀態的變更往往需要觸發其他相關狀態的更新。例如：

- 當檔案列表資料更新時 → 需要重新計算篩選與排序後的顯示資料 → 需要重置選取狀態 → 需要重置重新命名的暫存狀態
- 當排序條件改變時 → 同樣需要重新計算顯示資料 → 後續連鎖反應相同

若每次手動調用這些更新函數，不僅繁瑣易錯，更無法保證更新的順序與完整性。

### 依賴鏈機制

依賴鏈透過「訂閱-發布」模式，讓狀態之間建立明確的依賴關係：

```typescript
dataStore.subscribe(handleViewDataUpdate); // 來源資料變更 → 更新檢視資料
viewStateStore.subscribe(handleViewDataUpdate); // 檢視條件變更 → 更新檢視資料
viewDataStore.subscribe(handleSelectionUpdate); // 檢視資料變更 → 重置選取狀態
selectionStore.subscribe(handleRenameReset); // 選取狀態變更 → 重置重新命名狀態
```

### 原子性保證

關鍵在於：**所有訂閱的 handler 都是同步函數**。

在 JavaScript 的單執行緒模型下，當任意一個狀態變更時，整條訂閱鏈會在同一個 Call Stack 中依序執行完畢，不會被其他操作打斷。這確保了：

1. **完整性**：所有依賴更新都會執行，不會遺漏
2. **順序性**：更新按照依賴順序進行，不會錯亂
3. **原子性**：假設後端推送了更新，使用者又幾乎同時改變排序，單執行緒模型仍會先同步執行完後端更新的整條依賴鏈，然後才執行排序觸發的依賴鏈

透過語言層的執行模型，我們無需額外的事務或鎖機制，就能保證狀態更新的一致性。

## 請求佇列與載入狀態

使用者可能快速點擊多次導航按鈕，或在上一個請求尚未完成時觸發下一個請求。若不加控制，會導致：

1. **競態問題**：後發起的請求可能先完成，導致最終顯示的資料與預期不符
2. **載入狀態混亂**：多個請求並行時，無法準確判斷何時應顯示 loading、何時應隱藏

### 請求佇列

透過請求佇列機制，所有後端請求都被序列化並依序執行

- 請求按照加入順序依次執行
- 前一個請求完成後，才會處理下一個
- 根本上避免競態問題

同時基於請求佇列，載入狀態的判斷變得精準：

**只要佇列中還有待處理的請求，loading 就會維持顯示**，這是完全準確的全域載入狀態。

### 分層顯示策略

為避免短暫請求造成的 loading 閃爍，UI 採用 CSS 動畫延遲：

對於 Linear Progress Bar，其只會在 loading: true 時渲染，因此使用 CSS animation：

```tsx
animation: "progressDelay 0.15s steps(1, end)";
```

對於資料容器，由於其永遠存在，因此使用 CSS transition：

```tsx
transition: "opacity 0.05s step-end";
```

這實現了兩層載入回饋：

- **< 50ms**：完全不顯示 loading，避免閃爍
- **50ms ~ 150ms**：僅顯示內容半透明效果（輕量回饋）
- **> 150ms**：同時顯示進度條與半透明效果（完整回饋）

這些時間閾值完全由 CSS 動畫控制，不需要任何 JavaScript 計時器或狀態判斷，零開銷、零 bug，且與 UI 渲染完全同步。

## 雙檢視模式

系統瀏覽器支援兩種檢視模式：**表格模式**（directory）與**網格模式**（images），兩者共享同一套狀態管理架構，但呈現方式截然不同。

### 型別設計

透過 TypeScript 的聯合型別，定義統一的資料結構：

```typescript
type ReadResourceResult = OneOf<[ReadDirectoryResult, ReadImagesResult]>;
```

其中 `ReadDirectoryResult` 包含 `entries` 陣列，`ReadImagesResult` 包含 `imageEntries` 陣列，**關鍵在於：另一個陣列欄位必定為空陣列 `[]`**。

### 管道式處理

這種設計讓 Store 與 Action 層的邏輯完全統一，無需 if/else 分支：

```typescript
const entriesFiltered = filterEntries(entries); // 空陣列 → 空陣列
const entriesSorted = sortEntries(entriesFiltered); // 管道繼續
```

由於「空陣列也是陣列」，所有陣列處理函數（filter、sort、map 等）對空陣列的處理結果仍是空陣列，形成完美的管道流。同時處理兩種模式的資料：

```typescript
const layout = createWeightBasedLayout({ items: imageEntries, columns });
viewDataStore.setState({ entries: entriesSorted, imageEntries: { ...layout } });
```

無論當前是哪種模式，兩個欄位都會被計算與更新，只是其中一個必定為空。

### UI 條件渲染

**唯一需要 if/else 的地方只在 UI 層**，透過 `viewMode` 決定渲染哪個元件：

```tsx
const TableHead = () => {
  const viewMode = viewDataStore((state) => state.viewMode);
  if (viewMode !== "directory") return null;
  // ...
};
```

這種設計的優勢：

- **Store/Action 層零分支**：完全統一的處理邏輯
- **類型安全**：TypeScript 確保資料結構正確
- **擴展性強**：新增第三種模式只需擴展聯合型別與 UI 元件

## 表格虛擬化

當檔案列表包含數千甚至數萬項目時，若直接渲染所有 DOM 元素，會造成嚴重的效能問題。虛擬化技術透過「只渲染可見區域的項目」，將 DOM 數量控制在極小範圍。

### 虛擬化實現

資料列的虛擬化使用 `@tanstack/react-virtual` 庫，計算當前滾動位置可見的項目索引範圍，只渲染這些項目。

對於斑馬背景則有特殊設計，其**直接繪製在滾動容器本身**，而非 Row 元件：

```css
backgroundImage: linear-gradient(...);
backgroundSize: 100% ${tableRowHeight * 2}px;
backgroundPositionY: var(--scroll-top, 0px);
```

透過監聽滾動事件動態更新 CSS 變數 `--scroll-top`，讓背景圖案與內容同步移動。這種設計帶來多重優勢：

1. **視圖填滿**：即使資料列數較少，斑馬紋也能鋪滿整個視圖空間，視覺更協調
2. **視覺佔位符**：快速滾動或資料載入時，斑馬紋始終存在，根本上解決虛擬化後的白塊閃爍問題
3. **捲軸穿透**：背景繪製在滾動容器上，配合全域透明 `scrollbar-gutter`，條紋會穿透至捲軸下方，模擬行動端無縫捲動體驗
4. **零額外開銷**：Row 元件無需任何背景相關的邏輯或樣式，對虛擬化與排序功能具有極佳的適配性

### 樣式委派

所有樣式都集中在父容器的 `sx` prop 中，透過 CSS 選擇器委派給子元素：

```tsx
const tableSx: SxProps = {
  [`& .${tableClass.row}`]: { height: tableRowHeight, ... },
  [`& .${tableClass.rowCell}`]: { lineHeight: `${tableRowHeight}px`, ... },
};
```

這種模式的優勢：

- **統一管理**：所有佈局、顏色、動畫在同一處定義
- **極速渲染**：幾乎所有子元件（Row、Cell 等）都使用原生 HTML 元素，只處理資料與 className
- **主題整合**：最外層的 `Box` 是 MUI 元件，透過 `sx` prop 可直接使用主題變數（如 `color: "text.primary"`），套用給不同子元素

### 事件委派

所有事件處理器都註冊在父容器上，而非每個 Row：

```tsx
<Box onClick={handleClick} onContextMenu={handleContextMenu} onDragStart={handleDragStart}>
  {/* 數千個 Row */}
</Box>
```

當事件觸發時，透過 `e.target.closest()` 向上查找到對應的 Row，並從 `data-index` 屬性取得索引，再根據 Store 層獲取詳細資訊：

```typescript
const getIndexFromEvent = (e: React.SyntheticEvent) => {
  const indexStr = target.closest(`.${tableClass.row}`)?.getAttribute(tableRowIndexAttr);
  return Number(indexStr);
};
```

這種模式的優勢：

- **記憶體效率**：只有 3 個事件處理器，而非 N × 3 個
- **虛擬化友好**：Row 組件被銷毀/創建時，不需要註冊/移除事件
- **支援複雜互動**：框選、拖曳等需要全域協調的操作，天然適合事件委派

## 網格虛擬化

圖片網格檢視同樣實現了虛擬化，且與網格虛擬化相同，所有樣式透過父容器的 `sx` prop 委派給子元素，事件處理器註冊在父容器上並透過 `data-*` 屬性識別項目。這確保了數千個圖片項目的極速渲染與高效記憶體使用。

然而，圖片網格的佈局需求非常特殊：不同圖片有不同的寬高比，需要實現類似 Pinterest 的瀑布流效果，同時保持各欄位（軌道）的高度盡可能平衡。這種不規則佈局無法使用現有的虛擬化庫，必須自行實現。

### 兩層演算法

網格虛擬化採用**兩層計算**策略，將佈局與虛擬化分離：

**第一層：權重佈局（createWeightBasedLayout）**

在 Store 的依賴鏈中執行，將圖片分配到各個軌道（欄位）：

```typescript
items.forEach((item) => {
  const heightRatio = item.height / item.width; // 計算高度權重（假設寬度單位為 1）
  const columnIndex = columnHeights.reduce(/* 找到目前最短的軌道 */);

  tracks[columnIndex].push({ item, yStart, yEnd }); // 記錄權重座標
  columnHeights[columnIndex] = yEnd;
});
```

這層計算將每個圖片分配到「當前最短的軌道」（貪婪演算法），並記錄其在該軌道中的**權重座標**（yStart、yEnd）。關鍵在於使用「高度權重」而非像素值：`heightRatio = H / W`，這讓佈局結果與容器實際寬度無關。

**第二層：虛擬化計算（getVirtualizedItems）**

在渲染時執行，根據滾動位置與容器尺寸，將權重座標轉換為像素座標：

```typescript
const k = containerWidth / tracks.length;  // 權重轉像素的係數
const vStart = scrollTop / k;              // 視窗頂端的權重位置
const vEnd = (scrollTop + containerHeight) / k;  // 視窗底端的權重位置

// 對每個軌道使用二分搜尋，找到第一個可見項目
while (low <= high) {
  const mid = Math.floor((low + high) / 2);
  if (track[mid].yEnd > vStart) {
    firstVisibleIdx = mid;
    high = mid - 1;
  } else {
    low = mid + 1;
  }
}

// 從第一個可見項目開始遍歷，直到超出視窗底端
for (let i = firstVisibleIdx; i < track.length; i++) {
  if (trackItem.yStart > vEnd) break;
  visibleItems.push({ ...item, pixelX: colIndex * k, pixelY: yStart * k, ... });
}
```

透過二分搜尋找到每個軌道中第一個可見項目，然後向後遍歷直到超出視窗範圍。所有座標都從權重值乘以係數 `k` 轉換為最終的像素值。

### 兩層分離的優勢

這種設計帶來極致的效能優化：

1. **第一層只執行一次**：當圖片列表變更時才重新計算佈局，結果存入 Store 的 `imageEntries` 狀態
2. **第二層高頻執行**：每次滾動或視窗縮放時執行，但只需簡單的數學運算（係數轉換、二分搜尋），無需重新分配軌道
3. **響應式縮放**：視窗縮放時，權重座標乘以新的係數 `k` 即可得到正確的像素座標，無需重新計算整個佈局

相比於每次滾動都重新計算整個佈局，這種兩層策略將複雜的貪婪演算法從高頻執行路徑中移除，滾動與縮放時只需進行輕量的座標轉換與二分搜尋，效能提升顯著。

## 拖曳支援

系統瀏覽器的檔案支援拖曳操作，透過精心設計的資料傳輸格式，不僅能拖曳到作業系統的檔案總管，還能無縫整合 VSCode 的編輯器與檔案總管等內建視圖，實現真正的跨平台、跨應用程式的檔案拖放體驗。

### 對於資料傳輸的深入研究

拖曳功能的核心實現在 `startFileDrag` 函數中，透過標準的 HTML5 Drag and Drop API 的 `dataTransfer` 介面設定多種資料格式：

**DownloadURL**：遵循 Chrome 的 DownloadURL 規範，格式為 `<MIME類型>:<檔名>:<URL>`，當拖曳到作業系統檔案總管時，瀏覽器會自動下載該檔案並以指定的檔名儲存，這使得即使是本地檔案，也能透過 `file:///` 協議實現「拖曳即複製」的體驗。

**text/uri-list**：標準的 URI 列表格式，相容於大多數接受檔案路徑的應用程式。

**application/vnd.code.uri-list**：VSCode 專用的 URI 列表格式，透過研究 VSCode 原始碼發現的內部格式，當拖曳到 VSCode 編輯器區域時，會自動開啟該檔案；拖曳到 VSCode 檔案總管時，則會複製該檔案到目標資料夾。

**codefiles** 與 **resourceurls**：VSCode 內部使用的其他格式，進一步增強與 VSCode 生態系統的整合性。

所有格式都設定為同一個檔案的不同表示形式，接收端會根據自身支援的格式選擇最合適的處理方式，同時將 `effectAllowed` 設為 `"copy"`，明確告知系統這是複製操作。

## 表格框選

當需要選取大量檔案時，逐一點擊不僅效率低下，也容易遺漏。系統瀏覽器的表格模式實現了完整的框選（Box Selection）功能，使用者可透過拖曳滑鼠繪製選取框，快速選取矩形區域內的所有項目。

### 拖曳判斷與啟動

框選功能整合在表格的 `handleDragStart` 事件中，透過條件判斷決定拖曳行為：

```typescript
// 若拖動的資料列是檔案或檔案符號連結，且該列已被選取，則啟動檔案拖放操作
if (["file", "file-symlink-file"].includes(fileType) && isRowSelected) {
  startFileDrag({ e, fileName, filePath });
}
// 否則，若是左鍵點擊，則啟動框選操作
else if (e.button === 0) {
  e.preventDefault();
  // ... 框選邏輯
}
```

這種設計確保了拖曳與框選的和諧共存：已選取的檔案可以拖曳到其他位置，而在空白區域或未選取項目上拖曳則觸發框選。

### 三層協同機制

框選操作由三個獨立的處理器協同完成：

**1. 選取計算**

根據框選矩形的位置計算應選取哪些項目，透過將滑鼠座標轉換為相對於行容器的座標，再除以單行高度，即可計算出框選範圍內的項目索引。這種實現完全基於「座標 ↔ 索引」的數學轉換，不依賴 DOM 查詢或遍歷，與虛擬化或渲染實現完全解耦。

**2. 視覺繪製**

動態創建並更新視覺化的框選矩形，框選框使用虛線邊框與斜紋背景，透過 `repeating-linear-gradient` 實現動態條紋效果。所有樣式都使用 MUI 主題變數，確保在不同主題下的視覺一致性。

**3. 自動滾動**

當滑鼠接近容器邊緣時，自動滾動以擴展選取範圍，滾動速度採用非線性加速曲線（`Math.pow(1 - normalizedDistance, accelerationPower)`），距離邊緣越近，滾動越快，提供直觀的操作回饋。

來源事件僅更新滑鼠座標狀態，而三個處理器透過 `requestAnimationFrame` 在統一的更新循環中獲取狀態並執行。

## 縮圖快取

圖片網格檢視可能包含數百甚至數千張圖片，若每次滾動都重新載入縮圖，不僅造成大量重複的縮圖生成工作，更會導致嚴重的效能瓶頸與視覺閃爍。縮圖快取透過記憶化策略，將已載入的縮圖保存在記憶體中，同時使用 LRU 演算法管理快取大小，確保在有限的記憶體空間內最大化命中率。

### LRU 快取策略

自製的 `createCache` 函數結合了經典的 LRU（Least Recently Used）演算法與 Suspense-ready 資源模式，透過 JavaScript 的 `Map` 資料結構天然維護插入順序：

**快取命中（Hit）**：當請求的縮圖已在快取中時，將該項目從當前位置移除並重新插入到末尾，這使得最近使用的項目始終位於 Map 的尾部。

**快取未命中（Miss）**：觸發後端 API 生成縮圖，同時檢查快取大小，若達到上限，則刪除 Map 頭部的最久未使用項目，並拋出 Promise。

```typescript
if (cache.size >= limit) {
  const oldestKey = cache.keys().next().value;
  if (oldestKey !== undefined) cache.delete(oldestKey);
}
```

這種設計帶來極致的時空複雜度：

- **時間複雜度**：所有操作（查詢、插入、刪除）均為 O(1)
- **空間複雜度**：固定上限，不會無限增長

### Suspense 資源模式

縮圖快取採用 React 的 Suspense 資源模式，將非同步載入過程完全封裝在資源層，UI 元件只需呼叫 `thumbnailCache.get(filePath).read()`，即可獲得 base64 格式的縮圖資料：

```typescript
const ImageGridItem = memo(({ filePath }: { filePath: string }) => {
  const data = thumbnailCache.get(filePath).read();
  return <img className={imageGridClass.item} src={data} draggable={false} />;
});
```

當資源尚未載入完成時，`read()` 會拋出 Promise，被外層的 `<Suspense>` 捕獲並顯示骨架：

```tsx
<Suspense fallback={<div className={imageGridClass.item} />}>
  <ImageGridItem filePath={item.filePath} />
</Suspense>
```

### 後端壓縮邏輯

縮圖生成在延伸主機端執行，透過 `sharp` 圖片處理庫實現智慧壓縮：

**門檻判斷**：以 SD 解析度（720×480，約 34.5 萬像素）為基準，只對超過此解析度的圖片進行壓縮，避免對小圖片進行無意義的處理。

**等比縮放**：計算縮放係數 `scaleFactor = √(threshold / originalPixels)`，確保縮圖的總像素數接近門檻值，同時維持原始長寬比。

**格式轉換**：所有縮圖統一轉換為 WebP 格式，相比 JPEG 與 PNG，WebP 在相同視覺質量下具有更小的檔案體積，減少記憶體佔用與傳輸成本。

```typescript
const scaleFactor = Math.sqrt(PIXELS_THRESHOLD_1K / originalTotalPixels);
const targetWidth = Math.floor(width * scaleFactor);
return sharpToBase64(image.resize({ width: targetWidth }), "webp");
```

---

# 編輯體驗的全面進化

## 圖片檢視器

- 設計用來取代 VSCode 預設圖片編輯器 (其實原生的根本不算是編輯器，只是瀏覽器 (Electron) 的預設行為)
- JS 層重新實現 object-fit: contain 的邏輯，使初始的骨架與圖片一定能完美對齊
- 支援滑鼠/觸控板縮放、平移、慣性滾動
- 右鍵選單可快速重設視角
- 內建吸管工具，一鍵取色並複製
- 右鍵選單提供 "導出為..." 選項，可將圖片另存為其他格式
- 導出完成後，使用者可以點擊通知中的 "開啟檔案" 快速比較差異

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

## 自訂樣式注入

- 比起 `Custom JS and CSS Loader` 能更安全注入自訂 CSS 到 VSCode 介面
- 透過採用修改而非刪除 CSP 的策略，通過安全完整性檢查
- 以及建構插件時將 CSS 內聯為字串，消除執行時的檔案 I/O 也減少了安全風險

## 外部應用程式整合

- 在 VSCode 檔案總管右鍵任意檔案時，會有「使用系統預設應用程式開啟」的選項
- 同樣的在 tabs 上右鍵也有此選項
- 這使得你能快速預覽 html, pdf 等檔案在瀏覽器
- 又或是打開 .blend, .spp, .psd 等專有格式檔案在對應的原生應用程式中，讓你不需在離開 VSCode 的情況下快速切換工作流程

---

作者：1ureka | 版本：0.5.22
