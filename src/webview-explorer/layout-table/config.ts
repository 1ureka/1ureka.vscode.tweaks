import type { FileMetadata } from "@/feature-explorer/types";
import { colorMix } from "@/utils/client/ui";

/** 表格單元格的對齊方式 */
type TableCellAlign = "left" | "right" | "center";

/** 可用的表格欄位 */
type TableFields = Extract<keyof FileMetadata, "fileType" | "fileName" | "size" | "mtime" | "ctime">;

/** 表格某一個 column 的資訊定義，比如欄位名稱、對齊方式等 */
type TableColumn = {
  field: TableFields;
  align: TableCellAlign;
  label: string;
  weight: number;
  width?: number; // 若有設定 width，則會覆蓋權重
  sortable: boolean;
};

/** 定義系統瀏覽器表格的所有 column 及其屬性 */
const tableColumns: TableColumn[] = [
  {
    field: "fileName",
    align: "left",
    label: "名稱",
    weight: 3.5,
    sortable: true,
  },
  {
    field: "fileType",
    align: "right",
    label: "類型",
    weight: 2,
    sortable: false,
  },
  {
    field: "mtime",
    align: "right",
    label: "修改日期",
    weight: 1,
    width: 150,
    sortable: true,
  },
  {
    field: "ctime",
    align: "right",
    label: "建立日期",
    weight: 1,
    width: 150,
    sortable: true,
  },
  {
    field: "size",
    align: "right",
    label: "大小",
    weight: 1,
    width: 100,
    sortable: true,
  },
];

export type { TableCellAlign, TableFields, TableColumn };
export { tableColumns };

// ---------------------------------------------------------------------------------

/** 表格標題列的高度 */
const tableHeadHeight = 30;

/** 表格資料列的高度 */
const tableRowHeight = 26;

/** 表格列圖示欄位的固定寬度 */
const tableIconWidth = tableRowHeight;

/** 表格列圖示欄位的圖示大小 */
const tableIconFontSize = 16;

/** 表格交替背景色 */
const tableAlternateBgcolor = colorMix("background.content", "text.primary", 0.98);

export { tableHeadHeight, tableIconWidth, tableIconFontSize, tableRowHeight, tableAlternateBgcolor };

// ---------------------------------------------------------------------------------

/** 表格各種元素用於識別自身的 class */
const tableClass = {
  rowWrapper: "table-row-wrapper",
  row: "table-row",
  rowCell: "table-cell",
  rowClipboardOverlay: "table-row-clipboard-overlay",
};

/** 表格各種元素用於識別自身的 id */
const tableId = {
  scrollContainer: "table-scroll-container",
  rowsContainer: "table-rows-container",
};

export { tableClass, tableId };
