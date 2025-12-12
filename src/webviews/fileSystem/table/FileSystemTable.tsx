import React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Box, type SxProps } from "@mui/material";

import { fileSystemViewDataStore } from "../data/view";
import { tableRowHeight } from "./common";
import { NoItemDisplay } from "./NoItemDisplay";
import { TableHeadRow } from "./TableHeadRow";
import { TableNavigateUpRow } from "./TableNavigateUpRow";
import { TableRow } from "./TableRow";

/**
 * 用於呈現表格主體的組件
 */
const TableBody = () => {
  const viewEntries = fileSystemViewDataStore((state) => state.entries);

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
          <TableRow index={index} />
        </Box>
      ))}
    </Box>
  );
};

/**
 * 用於顯示系統瀏覽器的表格組件
 */
const FileSystemTable = () => (
  <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: 0.5, px: 2 }}>
    <TableHeadRow />
    <TableNavigateUpRow />
    <TableBody />
    <NoItemDisplay />
  </Box>
);

export { FileSystemTable };
