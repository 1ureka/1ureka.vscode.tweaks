import React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Box, type SxProps } from "@mui/material";
import { formatFileType } from "@/utils/formatter";

import { fileSystemDataStore } from "../data/data";
import { navigateToFolder, navigateUp } from "../data/navigate";
import { fileSystemViewDataStore } from "../data/view";
import { openFile } from "../data/action";
import { selectRow } from "../data/selection";

import { tableRowHeight } from "./common";
import { NoItemDisplay } from "./NoItemDisplay";
import { TableHeadRow } from "./TableHeadRow";
import { TableNavigateUpRow } from "./TableNavigateUpRow";
import { TableRow } from "./TableRow";

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
 * 用於呈現表格主體的組件
 */
const TableBody = () => {
  const isCurrentRoot = fileSystemDataStore((state) => state.isCurrentRoot);
  const viewEntries = fileSystemViewDataStore((state) => state.entries);
  const selected = fileSystemViewDataStore((state) => state.selected);
  const renamingIndex = fileSystemViewDataStore((state) => state.renamingIndex);

  const rows = viewEntries.map(({ fileName, fileType, mtime, ctime, fileSize, size, ...rest }) => ({
    ...rest,
    rawFileType: fileType,
    fileName,
    fileType: formatFileType({ fileName, fileType }),
    mtime: new Date(mtime).toLocaleString(),
    ctime: new Date(ctime).toLocaleDateString(),
    size: size > 0 ? fileSize : "",
  }));

  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => document.getElementById("file-system-body-wrapper"),
    count: viewEntries.length,
    estimateSize: () => tableRowHeight + 4,
    overscan: 10,
  });

  const virtualItemWrapperSx: SxProps = { position: "absolute", top: 0, left: 0, width: 1 };

  return (
    <Box
      id="file-system-virtualizer"
      sx={{ position: "relative", height: `${rowVirtualizer.getTotalSize()}px`, width: 1 }}
    >
      {rowVirtualizer.getVirtualItems().map(({ key, size, start, index }) => (
        <Box key={key} sx={{ ...virtualItemWrapperSx, height: `${size}px`, transform: `translateY(${start}px)` }}>
          <TableRow
            isDraggable={rows[index].rawFileType === "file" && renamingIndex !== index}
            isRenaming={renamingIndex === index}
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
 * 用於顯示系統瀏覽器的表格組件
 */
const FileSystemTable = () => {
  const isCurrentRoot = fileSystemDataStore((state) => state.isCurrentRoot);

  return (
    <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: 0.5, px: 2 }}>
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
