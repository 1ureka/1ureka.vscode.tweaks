import { memo } from "react";
import { create } from "zustand";
import type { UseBoundStore, StoreApi } from "zustand";
import { Box, ButtonBase, Typography, type SxProps } from "@mui/material";
import { colorMix, ellipsisSx } from "@/utils/ui";
import { useVirtualizer } from "@tanstack/react-virtual";

/**
 * 表格單元格的對齊方式
 */
type TableCellAlign = "left" | "right" | "center";

/**
 * 表格欄的類型
 */
type TableColumn = {
  field: string;
  align: TableCellAlign;
  label: string;
  rowVariant: "primary" | "secondary";
  formatter: (value: unknown) => string;
  weight: number;
  width?: number; // 若有設定 width，則會覆蓋權重
  sortable: boolean;
};

/**
 * 資料列的類型
 */
type TableRow = Record<string, string | number | Date>;

/**
 * 需注入的實際資料容器類型
 */
type DataStore = UseBoundStore<StoreApi<{ rows: TableRow[] }>>;

/**
 * 可選注入的載入狀態容器類型，可以用於顯示載入中效果
 */
type LoadingStore = UseBoundStore<StoreApi<{ loading: boolean }>>;

// ViewStateStore 改為在內部自行創建，並不暴露任何方法，但會暴露 TableHead, FilterDropdown 等
// 也就是 "你給我 DSL，我給你所有可以使用的 UI，並且我幫你組織好這些 UI 之間的互動邏輯"
// 若你有寫過 Blender 插件開發，這個概念類似於當你註冊一個新資料時，它會自動幫你生成各種 UI，你只需要寫 layout.prop, layout.template_list 之類的 DSL 就好

// SelectionStore 改為在內部自行創建，並返回/暴露 getSelectedRows 一個方法
// 相較於檢視狀態都是UI與計算列表與渲染有關的狀態(可以完全封裝)，這是唯一例外，因為外部仍需要知道目前選取了哪些資料列

// ---------------------------------------------------------------------------------

/**
 * 表格標題列的高度
 */
const tableHeadHeight = 30;

/**
 * 表格資料列的高度
 */
const tableRowHeight = 26;

/**
 * 圖示欄位的固定寬度
 */
const tableIconWidth = tableRowHeight;

/**
 * 圖示欄位的圖示大小
 */
const tableIconFontSize = 16;

/**
 * 表格標題列的樣式
 */
const tableHeadSx: SxProps = {
  display: "flex",
  alignItems: "stretch",
  width: 1,
  height: tableHeadHeight,
  borderRadius: 1,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  bgcolor: "background.paper",
  px: 0.5,

  // 讓 head 與 row/body 對齊，避免右側與 row/body 右側是不對齊的情況
  overflowY: "auto",
  scrollbarGutter: "stable",
};

/**
 * 用於表格標題列的單元格樣式
 */
const tableHeadCellSx: SxProps = {
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  overflow: "hidden",

  "&.align-left": { justifyContent: "flex-start", flexDirection: "row" },
  "&.align-center": { justifyContent: "center", flexDirection: "row" },
  "&.align-right": { justifyContent: "flex-start", flexDirection: "row-reverse" },

  "&.active": {
    cursor: "pointer",
    userSelect: "none",
    "&:hover > span.codicon": { color: "text.primary" },
    "& > span.codicon": { color: "text.secondary" },
  },
  "&.default": {
    cursor: "pointer",
    userSelect: "none",
    "&:hover > span.codicon": { color: "text.secondary" },
    "& > span.codicon": { color: "transparent" },
  },
  "&.disabled": {
    cursor: "default",
    userSelect: "auto",
  },
};

/**
 * 用於表格標題列的單元格內的標籤樣式
 */
const tableHeadCellLabelSx: SxProps = {
  ...ellipsisSx,

  "&.active": { color: "text.primary" },
  "&.default": { color: "text.primary" },
  "&.disabled": { color: "text.secondary" },
};

/**
 * 表格交替背景色
 */
const tableAlternateBgcolor = colorMix("background.content", "text.primary", 0.98);

/**
 * ### 表格背景設計
 *
 * 1. 背景由容器繪製，而非子元素。這確保了即便資料列數較少時，斑馬紋依然能鋪滿整個視圖空間。
 *
 * 2. 不使用 background-attachment: local 改用「預設背景 + CSS 變數同步」是為了避免 Scrollbar Gutter 區域出現空白 (沒有斑馬背景)。
 *
 * 3. Row 元件無需維護 index 或 nth-child 狀態，對於虛擬列表 (Virtual List) 或排序功能具有極佳的適配性與效能表現。
 */
const tableBodyContainerSx: SxProps = {
  flex: 1,
  overflowY: "auto",
  scrollbarGutter: "stable",
  minHeight: 0,
  borderRadius: 1,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  backgroundImage: `linear-gradient(var(--mui-palette-background-content) 50%, ${tableAlternateBgcolor} 50%)`,
  backgroundSize: `100% ${tableRowHeight * 2}px`,
  backgroundRepeat: "repeat",
  backgroundPositionY: "var(--scroll-top, 0px)",
};

/**
 * 用於表格某 row 中的單元格的樣式
 */
const tableRowCellSx: SxProps = {
  minWidth: 0,
  display: "flex",
  alignItems: "center",

  "&.align-left": { justifyContent: "flex-start" },
  "&.align-center": { justifyContent: "center" },
  "&.align-right": { justifyContent: "flex-end" },

  "& > span": { ...ellipsisSx, whiteSpace: "pre" },
  "& > span.primary": { color: "text.primary" },
  "& > span.secondary": { color: "text.secondary" },
} as SxProps;

/**
 * 用於表格中每一列的樣式
 */
const tableRowSx: SxProps = {
  position: "relative",
  width: 1,
  height: tableRowHeight,
  display: "flex",
  alignItems: "stretch",
  justifyContent: "stretch",
  px: 0.5,
  overflow: "visible",
  "&.selected": { bgcolor: "action.active" },
};

// ---------------------------------------------------------------------------------

/**
 * ?
 */
const createTableComponent = ({
  columns,
  dataStore,
  loadingStore,
  assignRowIcon,
  onSortCompare,
  onRenderRow,
}: {
  columns: TableColumn[];
  dataStore: DataStore;
  loadingStore?: LoadingStore;
  assignRowIcon: (row: TableRow) => `codicon codicon-${string}`;
  onSortCompare: (params: { a: TableRow; b: TableRow; field: string; order: "asc" | "desc" }) => number;
  onRenderRow?: (params: { row: TableRow; index: number }) => React.ReactNode;
}) => {
  /**
   * 建立表格的檢視狀態容器
   */
  const viewStateStore = create<{
    sortField: string;
    sortOrder: "asc" | "desc";
    filter: { field: string; matchs: string[] }[];
  }>(() => ({ sortField: columns[0].field, sortOrder: "asc", filter: [] }));

  /**
   * 建立用於儲存根據檢視條件計算後，要顯示的資料狀態的容器
   */
  const viewDataStore = create<{
    rows: TableRow[];
  }>(() => ({ rows: [] }));

  /**
   * 建立用於儲存選取狀態的容器
   */
  const selectionStore = create<{
    selected: (0 | 1)[];
    lastSelectedIndex: number | null;
    isBoxSelecting: boolean;
  }>(() => ({ selected: [], lastSelectedIndex: null, isBoxSelecting: false }));

  /**
   * 因為 React 元件內不能動態建立 Hook，因此對於這個可選的 loadingStore，利用閉包在此處建立
   */
  const viewLoadingStore = loadingStore ? loadingStore : create<{ loading: boolean }>(() => ({ loading: false }));

  /**
   * 設定排序欄位與順序，如果點擊的是同一欄位，切換順序；否則使用預設升序
   */
  const setSorting = (field: string) => {
    const { sortField, sortOrder } = viewStateStore.getState();

    const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";

    viewStateStore.setState({ sortField: field, sortOrder: newOrder });
  };

  /**
   * 獲取目前被選取的資料列
   */
  const getSelectedRows = () => {
    const { rows } = viewDataStore.getState();
    const { selected } = selectionStore.getState();

    return rows.filter((_, index) => selected[index] === 1);
  };

  // ---------------------------------------------------------------------------------

  /**
   * 當檢視條件或來源資料任一更新時，重新計算檢視資料
   */
  const handleViewDataUpdate = () => {
    const { rows } = dataStore.getState();
    const { sortField, sortOrder } = viewStateStore.getState();

    const rowsSorted = [...rows].sort((a, b) => onSortCompare({ a, b, field: sortField, order: sortOrder }));

    viewDataStore.setState({ rows: rowsSorted });
  };

  /**
   * 當檢視資料更新時，清空選取狀態
   */
  const handleSelectionUpdate = () => {
    const { rows } = viewDataStore.getState();

    const selected = Array<0 | 1>(rows.length).fill(0);

    selectionStore.setState({ isBoxSelecting: false, selected, lastSelectedIndex: null });
  };

  /**
   * 定義更新鏈/依賴鏈，由於 handler 都是同步的，因此鏈上任意一點產生的反應都會是原子化的
   *
   * 來源資料 ──┐
   *            ├──> 檢視資料 ────> 選取狀態
   * 檢視條件 ──┘
   */
  dataStore.subscribe(handleViewDataUpdate);
  viewStateStore.subscribe(handleViewDataUpdate);
  viewDataStore.subscribe(handleSelectionUpdate);
  handleViewDataUpdate(); // 初始化執行一次

  // ---------------------------------------------------------------------------------

  /**
   * 表格主體容器的唯一 ID
   */
  const tableBodyContainerId = "table-body-" + crypto.randomUUID().slice(0, 8);

  /**
   * 獲取表格主體容器的函式
   */
  const getTableBodyContainer = () => {
    return document.getElementById(tableBodyContainerId) as HTMLDivElement | null;
  };

  // ---------------------------------------------------------------------------------

  /**
   * 用於表格標題列的單元格
   */
  const TableHeadCell = ({ column }: { column: TableColumn }) => {
    const { field, label, align, weight, width, sortable } = column;

    const layoutStyle: React.CSSProperties = width ? { width } : { flex: weight };

    const sortField = viewStateStore((state) => state.sortField);
    const sortOrder = viewStateStore((state) => state.sortOrder);

    let state: "active" | "default" | "disabled";
    let handleClick: (() => void) | undefined = undefined;
    if (!sortable) {
      state = "disabled";
    } else {
      state = sortField === field ? "active" : "default";
      handleClick = () => setSorting(field);
    }

    return (
      <Box className={`${state} align-${align}`} sx={tableHeadCellSx} style={layoutStyle} onClick={handleClick}>
        <Typography className={state} variant="caption" sx={tableHeadCellLabelSx}>
          {label}
        </Typography>
        {state !== "disabled" && <span className={`codicon codicon-arrow-${sortOrder === "asc" ? "up" : "down"}`} />}
      </Box>
    );
  };

  /**
   * 表格標題列元件，可以讓使用者點擊排序
   */
  const TableHead = memo(() => (
    <Box sx={tableHeadSx}>
      <Box sx={{ width: tableIconWidth }} />
      {columns.map((column) => (
        <TableHeadCell key={column.field} column={column} />
      ))}
    </Box>
  ));

  // ---------------------------------------------------------------------------------

  /**
   * 表格主體容器滾動事件處理函式，用於同步背景位置
   */
  const handleScroll = () => {
    const container = getTableBodyContainer();
    if (container) {
      const scrollTop = container.scrollTop;
      container.style.setProperty("--scroll-top", `${-scrollTop}px`);
    }
  };

  /**
   * 用於呈現表格主體的容器組件
   */
  const TableBodyContainer = ({ children }: { children: React.ReactNode }) => (
    <Box id={tableBodyContainerId} onScroll={handleScroll} sx={tableBodyContainerSx}>
      {children}
    </Box>
  );

  /**
   * 用於表格某 row 中的單元格
   */
  const TableRowCell = ({ row, column }: { column: TableColumn; row: TableRow }) => {
    const { field, align, weight, width, rowVariant, formatter } = column;

    const layoutStyle: React.CSSProperties = width ? { width } : { flex: weight };

    return (
      <Box style={layoutStyle} sx={tableRowCellSx} className={`align-${align}`}>
        <Typography component="span" variant="caption" className={rowVariant}>
          {formatter(row[field])}
        </Typography>
      </Box>
    );
  };

  /**
   * 用於呈現一個普通的資料列
   */
  const TableRow = memo(({ index }: { index: number }) => {
    const viewRows = viewDataStore((state) => state.rows);
    const selected = selectionStore((state) => state.selected);

    const row = viewRows[index];
    const icon = assignRowIcon(row);
    const className = selected[index] ? `selected table-row` : `table-row`;

    return (
      <ButtonBase focusRipple sx={tableRowSx} className={className} data-index={index}>
        <Box sx={{ width: tableIconWidth, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <i className={icon} style={{ display: "flex", alignItems: "center", fontSize: tableIconFontSize }} />
        </Box>

        {columns.map((column) => (
          <TableRowCell key={column.field} column={column} row={row} />
        ))}

        {onRenderRow ? onRenderRow({ row, index }) : null}
      </ButtonBase>
    );
  });

  /**
   * 專注於用虛擬化渲染表格主體中的所有資料列
   */
  const TableBodyVirtualRows = () => {
    const rows = viewDataStore((state) => state.rows);
    const filter = viewStateStore((state) => state.filter);
    const loading = viewLoadingStore((state) => state.loading);

    const rowVirtualizer = useVirtualizer({
      getScrollElement: getTableBodyContainer,
      count: rows.length,
      estimateSize: () => tableRowHeight,
      overscan: 1,
    });

    const virtualItemListWrapperSx: SxProps = {
      position: "relative",
      height: `${rowVirtualizer.getTotalSize()}px`,
      width: 1,
      transition: "opacity 0.05s step-end", // 所有小於 50ms 的載入時間都不顯示載入回饋，以避免閃爍
    };

    const virtualItemWrapperSx: SxProps = {
      position: "absolute",
      top: 0,
      left: 0,
      width: 1,
    };

    let noItemMessage = "沒有任何項目";
    if (loading) {
      noItemMessage = "載入中...";
    } else if (filter.length > 0) {
      noItemMessage = "沒有符合過濾條件的項目";
    }

    return (
      <Box sx={virtualItemListWrapperSx} style={loading ? { opacity: 0.5 } : undefined}>
        {rows.length === 0 && (
          <Box sx={virtualItemWrapperSx} style={{ height: `${tableRowHeight}px`, transform: `translateY(0px)` }}>
            <Box sx={{ display: "grid", placeItems: "center", height: tableRowHeight }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {noItemMessage}
              </Typography>
            </Box>
          </Box>
        )}

        {rowVirtualizer.getVirtualItems().map(({ key, size, start, index }) => (
          <Box key={key} sx={virtualItemWrapperSx} style={{ height: `${size}px`, transform: `translateY(${start}px)` }}>
            <TableRow index={index} />
          </Box>
        ))}
      </Box>
    );
  };

  return { getSelectedRows, getTableBodyContainer };
};

export { createTableComponent };
