import React from "react";
import { Box, ButtonBase, type SxProps, Typography } from "@mui/material";
import { FileSystemTableRow, FileSystemTableRowDirUp, FileSystemTableRowHeader } from "./FileSystemTableRow";
import type { FieldDefinition } from "./FileSystemTableRow";

import { fileSystemDataStore } from "./data";
import { navigateToFile, navigateToFolder, navigateUp, setSorting } from "./navigate";

const fileSystemColumns: FieldDefinition[] = [
  { align: "left", label: "" },
  { align: "left", label: "名稱", dataField: "fileName" },
  { align: "right", label: "類型" },
  { align: "right", label: "修改日期", dataField: "mtime" },
  { align: "right", label: "建立日期", dataField: "ctime" },
  { align: "right", label: "大小", dataField: "size" },
];

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

  const gridTemplateColumns = "auto 1fr repeat(4, auto)";
  const containerShareSx: SxProps = { display: "grid", px: 2, gap: 0.5 };
  const containerSx: Record<string, SxProps> = {
    itemIsFullWidth: { position: "absolute", inset: 0, gridTemplateColumns: "1fr", ...containerShareSx },
    itemIsCell: { position: "relative", gridTemplateColumns, placeItems: "stretch", ...containerShareSx },
  };

  return (
    <Box sx={{ position: "relative" }}>
      {/* 每個項目的背景樣式區 */}
      <Box sx={containerSx.itemIsFullWidth}>
        <Box sx={{ bgcolor: "background.paper", borderRadius: 1 }} />

        {!root && <Box sx={{ borderRadius: 1, bgcolor: "table.alternateRowBackground" }} />}

        {files.map(({ fileName }, i) => (
          <Box
            key={fileName}
            sx={{ borderRadius: 1, bgcolor: i % 2 !== 0 ? "table.alternateRowBackground" : "transparent" }}
          />
        ))}
      </Box>

      {/* 每個項目的實際內容，包括 header 的可點擊區 */}
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

      {/* 每個 row 的可點擊區，除了 header */}
      <Box sx={{ ...containerSx.itemIsFullWidth, pointerEvents: "none" }}>
        <Box />

        {!root && (
          <ButtonBase
            sx={{ borderRadius: 1, pointerEvents: "auto", "&:hover": { bgcolor: "table.hoverBackground" } }}
            onClick={() => navigateUp()}
            focusRipple
          />
        )}

        {files.map(({ fileName, filePath, fileType }) => (
          <ButtonBase
            key={fileName}
            sx={{ borderRadius: 1, pointerEvents: "auto", "&:hover": { bgcolor: "table.hoverBackground" } }}
            focusRipple
            onClick={() => {
              if (fileType === "folder" || fileType === "file-symlink-directory") {
                navigateToFolder(filePath);
              } else if (fileType === "file" || fileType === "file-symlink-file") {
                navigateToFile(filePath);
              }
            }}
          >
            {/* Empty ButtonBase to make the entire row clickable */}
          </ButtonBase>
        ))}
      </Box>
    </Box>
  );
};

export { FileSystemTable };
