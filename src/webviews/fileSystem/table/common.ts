import type { SxProps } from "@mui/material";
import type { FileProperties } from "@/webviews/fileSystem/data/view";

/**
 * 圖示欄位的固定寬度
 */
const tableIconWidth = 48;

/**
 * 表格列的固定高度
 */
const tableRowHeight = 36;

/**
 * 表格單元格的對齊方式
 */
type TableCellAlign = "left" | "right" | "center";

/**
 * 可用的表格欄位
 */
type TableFields = Exclude<keyof FileProperties, "icon" | "filePath">;

/**
 * 表格某一個 column 且該 column 為圖示類型的資訊定義，比如欄位名稱、對齊方式等
 */
type TableIconColumn = {
  field: "icon";
};

/**
 * 表格某一個 column 的資訊定義，比如欄位名稱、對齊方式等
 */
type TableColumn = {
  field: TableFields;
  align: TableCellAlign;
  label: string;
  weight: number;
  sortable: boolean;
};

/**
 * 定義系統瀏覽器表格的所有 column 及其屬性
 */
const tableColumns: [TableIconColumn, ...TableColumn[]] = [
  {
    field: "icon",
  },
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
    weight: 2,
    sortable: true,
  },
  {
    field: "ctime",
    align: "right",
    label: "建立日期",
    weight: 1,
    sortable: true,
  },
  {
    field: "size",
    align: "right",
    label: "大小",
    weight: 1,
    sortable: true,
  },
];

/**
 * 用於表格中每一列的基礎樣式
 */
const tableRowBaseSx: SxProps = {
  position: "relative",
  display: "flex",
  gap: 1,
  pr: 1,
  width: 1,
  alignItems: "stretch",
  justifyContent: "stretch",
  height: tableRowHeight,
  borderRadius: 1,
  overflow: "visible",
};

export { tableColumns, tableIconWidth, tableRowHeight, tableRowBaseSx };
export type { TableColumn };
