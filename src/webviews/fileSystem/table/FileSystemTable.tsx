import React from "react";
import { Box, type SxProps } from "@mui/material";
import { TableHeadRow, TableNavigateUpRow, TableRow } from "./FileSystemTableRow";

import { fileSystemDataStore } from "../data/data";
import { navigateToFolder, navigateUp } from "../data/navigate";
import { fileSystemViewDataStore, selectRow, useIsSelected } from "../data/view";
import { openFile } from "../data/action";

/**
 * 用於呈現每一列的背景樣式
 */
function createRowBackgroundSx({ index, selected }: { index: number; selected: boolean }): SxProps {
  let bgcolor = index % 2 === 0 ? "table.alternateRowBackground" : "transparent";
  let hoverBgcolor = "table.hoverBackground";

  if (selected) {
    bgcolor = "table.selectedBackground";
    hoverBgcolor = "table.selectedHoverBackground";
  }

  return { borderRadius: 1, pointerEvents: "auto", bgcolor, "&:hover": { bgcolor: hoverBgcolor } };
}

/**
 * 為每列元素創建點擊監聽
 */
const createHandleRowClick = (fileType: string, filePath: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
  selectRow(filePath);

  if (e.detail !== 2) return;

  if (fileType === "folder" || fileType === "file-symlink-directory") {
    navigateToFolder(filePath);
  } else if (fileType === "file" || fileType === "file-symlink-file") {
    openFile(filePath);
  }
};

const fileTypeLabels: Record<string, string> = {
  file: "檔案",
  folder: "資料夾",
  "file-symlink-file": "符號連結檔案",
  "file-symlink-directory": "符號連結資料夾",
};

/**
 * 用於顯示檔案系統的表格組件
 */
const FileSystemTable = () => {
  const isCurrentRoot = fileSystemDataStore((state) => state.isCurrentRoot);

  const viewEntries = fileSystemViewDataStore((state) => state.entries);
  const isSelected = useIsSelected();

  const rows = viewEntries.map(({ fileType, mtime, ctime, fileSize, size, ...rest }) => ({
    ...rest,
    rawFileType: fileType,
    fileType: fileTypeLabels[fileType],
    mtime: new Date(mtime).toLocaleString(),
    ctime: new Date(ctime).toLocaleDateString(),
    size: size > 0 ? fileSize : "",
  }));

  return (
    <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: 0.5 }}>
      <TableHeadRow />

      {!isCurrentRoot ? (
        <TableNavigateUpRow sx={createRowBackgroundSx({ index: 0, selected: false })} onClick={navigateUp} />
      ) : null}

      {rows.map((row, index) => (
        <TableRow
          key={row.fileName}
          row={row}
          sx={createRowBackgroundSx({ index: isCurrentRoot ? index : index + 1, selected: isSelected(row.filePath) })}
          onClick={createHandleRowClick(row.rawFileType, row.filePath)}
        />
      ))}
    </Box>
  );
};

export { FileSystemTable };
