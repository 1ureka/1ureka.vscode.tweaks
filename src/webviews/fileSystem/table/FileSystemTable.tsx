import React from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Box, type SxProps } from "@mui/material";
import { TableHeadRow, TableNavigateUpRow, TableRow, tableRowHeight } from "./FileSystemTableRow";
import { NoItemDisplay } from "./NoItemDisplay";

import { fileSystemDataStore } from "../data/data";
import { navigateToFolder, navigateUp } from "../data/navigate";
import { fileSystemViewDataStore } from "../data/view";
import { openFile } from "../data/action";
import { selectRow } from "../data/selection";

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
const createHandleRowClick =
  (fileType: string, filePath: string, index: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
    selectRow({ index, isAdditive: e.ctrlKey || e.metaKey, isRange: e.shiftKey });

    if (e.detail !== 2) return;

    if (fileType === "folder" || fileType === "file-symlink-directory") {
      navigateToFolder({ dirPath: filePath });
    } else if (fileType === "file" || fileType === "file-symlink-file") {
      openFile(filePath);
    }
  };

/**
 * 檔案類型標籤對應表
 */
const fileTypeLabels: Record<string, string> = {
  file: "檔案",
  folder: "資料夾",
  "file-symlink-file": "符號連結檔案",
  "file-symlink-directory": "符號連結資料夾",
};

/**
 * 用於呈現表格主體的組件
 */
const TableBody = () => {
  const isCurrentRoot = fileSystemDataStore((state) => state.isCurrentRoot);
  const viewEntries = fileSystemViewDataStore((state) => state.entries);
  const selected = fileSystemViewDataStore((state) => state.selected);

  const rows = viewEntries.map(({ fileType, mtime, ctime, fileSize, size, ...rest }) => ({
    ...rest,
    rawFileType: fileType,
    fileType: fileTypeLabels[fileType],
    mtime: new Date(mtime).toLocaleString(),
    ctime: new Date(ctime).toLocaleDateString(),
    size: size > 0 ? fileSize : "",
  }));

  const rowVirtualizer = useWindowVirtualizer({
    count: viewEntries.length,
    estimateSize: () => tableRowHeight + 4,
    overscan: 10,
  });

  const virtualItemWrapperSx: SxProps = { position: "absolute", top: 0, left: 0, width: 1 };

  return (
    <Box sx={{ position: "relative", height: `${rowVirtualizer.getTotalSize()}px`, width: 1 }}>
      {rowVirtualizer.getVirtualItems().map(({ key, size, start, index }) => (
        <Box key={key} sx={{ ...virtualItemWrapperSx, height: `${size}px`, transform: `translateY(${start}px)` }}>
          <TableRow
            row={rows[index]}
            onClick={createHandleRowClick(rows[index].rawFileType, rows[index].filePath, index)}
            sx={createRowBackgroundSx({ index: isCurrentRoot ? index : index + 1, selected: Boolean(selected[index]) })}
          />
        </Box>
      ))}
    </Box>
  );
};

/**
 * 用於顯示檔案系統的表格組件
 */
const FileSystemTable = () => {
  const isCurrentRoot = fileSystemDataStore((state) => state.isCurrentRoot);

  return (
    <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: 0.5 }}>
      <TableHeadRow />

      {!isCurrentRoot ? (
        <TableNavigateUpRow sx={createRowBackgroundSx({ index: 0, selected: false })} onClick={navigateUp} />
      ) : null}

      <TableBody />

      <NoItemDisplay />
    </Box>
  );
};

export { FileSystemTable };
