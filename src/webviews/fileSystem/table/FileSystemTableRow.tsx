import React from "react";
import { Box } from "@mui/material";
import { FileSystemListCell, FileSystemListCellText, FileSystemListHeaderCell } from "./FileSystemTableCell";
import type { FileProperties } from "../data/view";

type RowDirUpProps = {
  columns: number;
  icon: `codicon codicon-${string}`;
  text: string;
};

/**
 * 檔案系統表格中，表示「上層目錄」的列組件
 */
const FileSystemTableRowDirUp = ({ columns, icon, text }: RowDirUpProps) => {
  const columnsArray = Array(columns).fill(null);

  return (
    <>
      {columnsArray.map((_, i) => (
        <FileSystemListCell key={i} align={i === 0 || i === 1 ? "left" : "right"}>
          {i === 0 ? (
            <span className={icon} style={{ display: "flex", alignItems: "center" }} />
          ) : i === 1 ? (
            <FileSystemListCellText text={text} variant="primary" />
          ) : (
            <Box />
          )}
        </FileSystemListCell>
      ))}
    </>
  );
};

type RowProps = Pick<FileProperties, "icon" | "fileName" | "fileType" | "fileSize" | "mtime" | "ctime" | "size">;

const fileTypeLabels: Record<string, string> = {
  file: "檔案",
  folder: "資料夾",
  "file-symlink-file": "符號連結檔案",
  "file-symlink-directory": "符號連結資料夾",
};

/**
 * 檔案系統表格中，表示單一檔案或資料夾的列組件
 */
const FileSystemTableRow = ({ icon, fileName, fileType, fileSize, mtime, ctime, size }: RowProps) => (
  <>
    <FileSystemListCell align="left">
      <span className={icon} style={{ display: "flex", alignItems: "center" }} />
    </FileSystemListCell>

    <FileSystemListCell align="left">
      <FileSystemListCellText text={fileName} variant="primary" />
    </FileSystemListCell>

    <FileSystemListCell>
      <FileSystemListCellText text={fileTypeLabels[fileType]} />
    </FileSystemListCell>

    <FileSystemListCell>
      <FileSystemListCellText text={new Date(mtime).toLocaleString()} />
    </FileSystemListCell>

    <FileSystemListCell>
      <FileSystemListCellText text={new Date(ctime).toLocaleDateString()} />
    </FileSystemListCell>

    <FileSystemListCell>{size > 0 && <FileSystemListCellText text={fileSize} />}</FileSystemListCell>
  </>
);

type SortableField = "fileName" | "mtime" | "ctime" | "size";

type FieldDefinition = {
  align: "left" | "center" | "right";
  label: string;
  dataField?: SortableField;
};

type RowHeaderProps = {
  fields: FieldDefinition[];
  sortField: SortableField;
  sortOrder: "asc" | "desc";
  onSortChange: (field: SortableField) => void;
};

/**
 * 檔案系統表格中，表示表頭列的組件
 */
const FileSystemTableRowHeader = ({ fields, sortField, sortOrder, onSortChange }: RowHeaderProps) => (
  <>
    {fields.map(({ align, label, dataField }) => (
      <FileSystemListHeaderCell
        key={label}
        title={label}
        align={align}
        sortable={Boolean(dataField)}
        active={sortField === dataField}
        sortOrder={sortOrder}
        onClick={() => dataField && onSortChange(dataField)}
      />
    ))}
  </>
);

export { FileSystemTableRowHeader, FileSystemTableRowDirUp, FileSystemTableRow };
export type { FieldDefinition };
