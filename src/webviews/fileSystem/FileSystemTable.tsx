import React from "react";
import { Box, ButtonBase, type SxProps, Typography } from "@mui/material";
import { FileSystemTableRow, FileSystemTableRowDirUp, FileSystemTableRowHeader } from "./FileSystemTableRow";
import type { FieldDefinition } from "./FileSystemTableRow";

import { fileSystemDataStore } from "./data";
import { navigateToFile, navigateToFolder, navigateUp, setSorting } from "./navigate";

/**
 * 檔案系統表格包含的欄位
 */
const fileSystemColumns: FieldDefinition[] = [
  { align: "left", label: "" },
  { align: "left", label: "名稱", dataField: "fileName" },
  { align: "right", label: "類型" },
  { align: "right", label: "修改日期", dataField: "mtime" },
  { align: "right", label: "建立日期", dataField: "ctime" },
  { align: "right", label: "大小", dataField: "size" },
];

/**
 * 用於顯示檔案系統的表格組件
 */
const FileSystemTable = () => {
  const files = fileSystemDataStore((state) => state.files);
  const root = fileSystemDataStore((state) => state.root);
  const sortField = fileSystemDataStore((state) => state.sortField);
  const sortOrder = fileSystemDataStore((state) => state.sortOrder);

  if (files.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
        <Typography color="text.secondary">此資料夾是空的</Typography>
      </Box>
    );
  }

  const containerShareSx: SxProps = { display: "grid", gap: 0.5 };
  const containerSx: Record<string, SxProps> = {
    itemIsFullWidth: {
      position: "absolute",
      inset: 0,
      gridTemplateColumns: "1fr",
      ...containerShareSx,
    },
    itemIsCell: {
      position: "relative",
      gridTemplateColumns: "auto 1fr repeat(4, auto)",
      placeItems: "stretch",
      pointerEvents: "none",
      ...containerShareSx,
    },
  };

  const borderRadius = 1;

  const createBackgroundSx: (index: number) => SxProps = (index) => ({
    borderRadius,
    pointerEvents: "auto",
    bgcolor: index % 2 === 0 ? "table.alternateRowBackground" : "transparent",
    "&:hover": { bgcolor: "table.hoverBackground" },
  });

  const handleDirUpRowClick = () => {
    navigateUp();
  };

  const createHandleRowClick = (fileType: string, filePath: string) => () => {
    if (fileType === "folder" || fileType === "file-symlink-directory") {
      navigateToFolder(filePath);
    } else if (fileType === "file" || fileType === "file-symlink-file") {
      navigateToFile(filePath);
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      {/* 每個 row 的點擊區，同時也是背景樣式 */}
      <Box sx={containerSx.itemIsFullWidth}>
        <Box sx={{ bgcolor: "background.paper", borderRadius }} />

        {!root && <ButtonBase focusRipple sx={createBackgroundSx(0)} onClick={handleDirUpRowClick} />}

        {files.map(({ fileName, filePath, fileType }, i) => (
          <ButtonBase
            key={fileName}
            focusRipple
            sx={createBackgroundSx(i + 1)}
            onClick={createHandleRowClick(fileType, filePath)}
          />
        ))}
      </Box>

      {/* 每個 row 的實際內容，包括 header 的可點擊區 (header cell 會設 pointerEvents 回來) */}
      <Box sx={containerSx.itemIsCell}>
        <FileSystemTableRowHeader
          fields={fileSystemColumns}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={(field) => setSorting(field)}
        />

        {!root && <FileSystemTableRowDirUp columns={6} icon="codicon codicon-folder-opened" text=".." />}

        {files.map(({ icon, fileName, fileType, fileSize, mtime, ctime, size }) => (
          <FileSystemTableRow
            key={fileName}
            icon={icon}
            fileName={fileName}
            fileType={fileType}
            fileSize={fileSize}
            mtime={mtime}
            ctime={ctime}
            size={size}
          />
        ))}
      </Box>
    </Box>
  );
};

export { FileSystemTable };
