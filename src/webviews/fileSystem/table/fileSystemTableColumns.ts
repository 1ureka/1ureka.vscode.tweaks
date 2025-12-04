import type { OneOf } from "@/utils";
import { FileProperties } from "@/webviews/fileSystem/data/view";

type TableCellAlign = "left" | "right" | "center";
type TableFields = Exclude<keyof FileProperties, "filePath" | "fileSize">;

/**
 * 表格某一個 column 且該 column 為圖示類型的資訊定義，比如欄位名稱、對齊方式等
 */
type TableIconColumn = {
  field: "icon";
  align: TableCellAlign;
  label: string;
  width: number;
  sortable: false;
};

/**
 * 表格某一個 column 且該 column 為文字類型的資訊定義，比如欄位名稱、對齊方式等
 */
type TableTextColumn = {
  field: Exclude<TableFields, "icon">;
  align: TableCellAlign;
  label: string;
  weight: number;
  sortable: boolean;
};

/**
 * 表格某一個 column 的資訊定義，比如欄位名稱、對齊方式等
 */
type TableColumn = OneOf<[TableIconColumn, TableTextColumn]>;

/**
 * 定義檔案系統表格的所有 column 及其屬性
 */
const tableColumns: TableColumn[] = [
  {
    field: "icon",
    align: "center",
    label: "",
    width: 48,
    sortable: false,
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

export { tableColumns };
export type { TableColumn, TableIconColumn, TableTextColumn, TableFields };
