import React from "react";
import type { ButtonBaseProps, SxProps } from "@mui/material";
import { ButtonBase } from "@mui/material";
import { formatFileSize, formatFileType } from "@/utils/formatter";
import { endRenaming } from "../data/action";

import { fileSystemViewDataStore } from "@/webviews/fileSystem/data/view";
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
 * 根據項目名稱創建編輯結束事件處理器
 */
const createHandleSendEdit = (name: string) => {
  return (newName: string) => {
    endRenaming({ name, newName });
  };
};

/**
 * 用於呈現一個普通的資料列
 */
const TableRow = ({ sx, index, ...props }: ButtonBaseProps & { index: number }) => {
  const viewEntries = fileSystemViewDataStore((state) => state.entries);
  const row = viewEntries[index];

  const renamingIndex = fileSystemViewDataStore((state) => state.renamingIndex);
  const isRenaming = renamingIndex === index;

  const isDraggable = row.fileType === "file" && !isRenaming;

  const draggableProps: Partial<ButtonBaseProps> = isDraggable
    ? { draggable: true, onDragStart: createHandleDragStart(row) }
    : {};

  const mergedSx: SxProps = { ...tableRowBaseSx, ...sx } as SxProps;

  return (
    <ButtonBase focusRipple disabled={isRenaming} sx={mergedSx} {...draggableProps} {...props}>
      {tableColumns.map((column) => {
        const { field } = column;
        const textVariant = field === "fileName" ? "primary" : "secondary";

        if (field === "icon") {
          return <TableIconCell key={field} icon={row.icon} />;
        }

        if (field === "fileName" && isRenaming) {
          const handleSend = createHandleSendEdit(row.fileName);
          return <TableEditingCell key={field} defaultValue={row[field]} column={column} onSend={handleSend} />;
        }

        let formatted: string;

        if (field === "fileType") {
          formatted = formatFileType({ fileName: row.fileName, fileType: row.fileType });
        } else if (field === "ctime") {
          formatted = new Date(row.ctime).toLocaleDateString();
        } else if (field === "mtime") {
          formatted = new Date(row.mtime).toLocaleString();
        } else if (field === "size") {
          formatted = row.fileType === "file" ? formatFileSize(row.size) : "";
        } else {
          formatted = String(row[field]);
        }

        return <TableCell key={field} variant={textVariant} text={formatted} column={column} />;
      })}

      <TableRowClipboardDecorator filePath={row.filePath} />
    </ButtonBase>
  );
};

export { TableRow };
