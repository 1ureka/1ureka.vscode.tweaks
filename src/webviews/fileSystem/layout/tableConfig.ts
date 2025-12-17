import type { FileProperties } from "@/webviews/fileSystem/data/view";

/**
 * 表格單元格的對齊方式
 */
type TableCellAlign = "left" | "right" | "center";

/**
 * 可用的表格欄位
 */
type TableFields = Exclude<keyof FileProperties, "icon" | "filePath">;

/**
 * 表格某一個 column 的資訊定義，比如欄位名稱、對齊方式等
 */
type TableColumn = {
  field: TableFields;
  align: TableCellAlign;
  label: string;
  weight: number;
  width?: number; // 若有設定 width，則會覆蓋權重
  sortable: boolean;
};

/**
 * 定義系統瀏覽器表格的所有 column 及其屬性
 */
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

/**
 * 表格標題列的高度
 */
const tableHeadHeight = 32;

/**
 * 表格每 row 的高度
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

export { tableColumns, tableHeadHeight, tableIconWidth, tableIconFontSize, tableRowHeight };
export type { TableCellAlign, TableFields, TableColumn };
