import React from "react";
import { Box, ButtonBase, type SxProps } from "@mui/material";
import { FileSystemTableRow, FileSystemTableRowDirUp, FileSystemTableRowHeader } from "./FileSystemTableRow";
import type { FieldDefinition } from "./FileSystemTableRow";

import { fileSystemDataStore } from "../data/data";
import { navigateToFolder, navigateUp } from "../data/navigate";
import { fileSystemViewDataStore, fileSystemViewStore, selectRow, setSorting, useIsSelected } from "../data/view";
import { openFile } from "../data/action";

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

const containerShareSx: SxProps = { display: "grid", gap: 0.5 };
/** 用於呈現虛擬 + 實際表格的容器樣式 */
const containerSx: Record<string, SxProps> = {
  itemIsFullWidth: {
    position: "absolute",
    inset: 0,
    gridTemplateColumns: "1fr",
    ...containerShareSx,
  },
  itemIsCells: {
    position: "relative",
    gridTemplateColumns: "auto 1fr repeat(4, auto)",
    placeItems: "stretch",
    pointerEvents: "none",
    ...containerShareSx,
  },
};

/** 用於呈現每一列的背景樣式 */
function createRowBackgroundSx({ index, selected }: { index: number; selected: boolean }): SxProps {
  let bgcolor = index % 2 === 0 ? "table.alternateRowBackground" : "transparent";
  let hoverBgcolor = "table.hoverBackground";

  if (selected) {
    bgcolor = "table.selectedBackground";
    hoverBgcolor = "table.selectedHoverBackground";
  }

  return { borderRadius: 1, pointerEvents: "auto", bgcolor, "&:hover": { bgcolor: hoverBgcolor } };
}

const handleDirUpRowClick = () => navigateUp();

/** 為每列元素創建點擊監聽 */
const createHandleRowClick = (fileType: string, filePath: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
  selectRow(filePath);

  if (e.detail !== 2) return;

  if (fileType === "folder" || fileType === "file-symlink-directory") {
    navigateToFolder(filePath);
  } else if (fileType === "file" || fileType === "file-symlink-file") {
    openFile(filePath);
  }
};

/**
 * 用於顯示檔案系統的表格組件
 */
const FileSystemTable = () => {
  const viewEntries = fileSystemViewDataStore((state) => state.entries);
  const isCurrentRoot = fileSystemDataStore((state) => state.isCurrentRoot);
  const sortField = fileSystemViewStore((state) => state.sortField);
  const sortOrder = fileSystemViewStore((state) => state.sortOrder);
  const isSelected = useIsSelected();

  return (
    <Box sx={{ position: "relative" }}>
      {/* 每個 row 的點擊區，同時也是背景樣式 */}
      <Box sx={containerSx.itemIsFullWidth}>
        <Box sx={{ bgcolor: "background.paper", borderRadius: 1 }} />

        {!isCurrentRoot && (
          <ButtonBase
            focusRipple
            sx={createRowBackgroundSx({ index: 0, selected: false })}
            onClick={handleDirUpRowClick}
          />
        )}

        {viewEntries.map(({ fileName, filePath, fileType }, i) => (
          <ButtonBase
            key={fileName}
            focusRipple
            sx={createRowBackgroundSx({ index: i + 1, selected: isSelected(filePath) })}
            onClick={createHandleRowClick(fileType, filePath)}
          />
        ))}
      </Box>

      {/* 每個 row 的實際內容，包括 header 的可點擊區 (header cell 會設 pointerEvents 回來) */}
      <Box sx={containerSx.itemIsCells}>
        <FileSystemTableRowHeader
          fields={fileSystemColumns}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={(field) => setSorting(field)}
        />

        {!isCurrentRoot && <FileSystemTableRowDirUp columns={6} icon="codicon codicon-folder-opened" text=".." />}

        {viewEntries.map(({ icon, fileName, fileType, fileSize, mtime, ctime, size }) => (
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
