import React from "react";
import type { ButtonBaseProps, SxProps } from "@mui/material";
import { ButtonBase } from "@mui/material";
import { formatFileType } from "@/utils/formatter";
import { endRenaming } from "../data/action";

import type { TableFields } from "./common";
import { tableColumns, tableRowBaseSx } from "./common";
import { TableIconCell, TableCell, TableEditingCell } from "./TableRowCell";
import { TableRowClipboardDecorator } from "./TableRowDecorators";

/**
 * 根據項目路徑和名稱創建拖放開始事件處理器
 */
const createHandleDragStart = (params: { filePath: string; fileName: string }) => {
  const { filePath, fileName } = params;

  const handler: React.DragEventHandler<HTMLButtonElement> = (e) => {
    const fileUrl = `file:///${filePath.replace(/\\/g, "/")}`;
    const mimeType = "application/octet-stream";
    const downloadURL = `${mimeType}:${fileName}:${fileUrl}`;

    e.dataTransfer.setData("DownloadURL", downloadURL);
    e.dataTransfer.setData("text/uri-list", fileUrl);
    e.dataTransfer.setData("application/vnd.code.uri-list", JSON.stringify([fileUrl]));
    e.dataTransfer.setData("codefiles", JSON.stringify([filePath]));
    e.dataTransfer.setData("resourceurls", JSON.stringify([fileUrl]));
    e.dataTransfer.effectAllowed = "copy";
  };

  return handler;
};

/**
 * 普通資料列組件的 props 型別
 */
type TableRowProps = ButtonBaseProps & {
  row: Record<TableFields, string> & { icon: `codicon codicon-${string}`; filePath: string };
  isDraggable: boolean;
  isRenaming: boolean;
};

/**
 * 用於呈現一個普通的資料列
 */
const TableRow = ({ sx, row, isDraggable, isRenaming, ...props }: TableRowProps) => {
  const draggableProps: Partial<ButtonBaseProps> = isDraggable
    ? { draggable: true, onDragStart: createHandleDragStart(row) }
    : {};

  const mergedSx: SxProps = { ...tableRowBaseSx, ...sx } as SxProps;

  return (
    <ButtonBase focusRipple={!isRenaming} sx={mergedSx} {...draggableProps} {...props}>
      {tableColumns.map((column) => {
        const { field } = column;
        const textVariant = field === "fileName" ? "primary" : "secondary";

        if (field === "icon") {
          return <TableIconCell key={field} icon={row.icon} />;
        }

        if (field === "fileType") {
          const { fileName, fileType } = row;
          const formatted = formatFileType({ fileName, fileType });
          return <TableCell key={field} variant={textVariant} text={formatted} column={column} />;
        }

        if (field !== "fileName" || !isRenaming) {
          return <TableCell key={field} variant={textVariant} text={row[field]} column={column} />;
        }

        return (
          <TableEditingCell
            key={field}
            text={row[field]}
            column={column}
            onBlur={(newName) => endRenaming({ name: row.fileName, newName })}
          />
        );
      })}

      <TableRowClipboardDecorator filePath={row.filePath} />
    </ButtonBase>
  );
};

export { TableRow };
