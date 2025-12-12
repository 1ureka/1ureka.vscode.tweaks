import React from "react";
import { Box } from "@mui/material";
import { TableHeadCell } from "./TableHeadRowCell";
import { tableColumns, tableIconWidth, tableRowBaseSx } from "./common";
import { fileSystemViewStore } from "../data/view";
import { setSorting } from "../data/action";

/**
 * 用於呈現表格標題列，會自動從 store 取得目前的排序欄位與排序順序
 */
const TableHeadRow = () => {
  const sortField = fileSystemViewStore((state) => state.sortField);
  const sortOrder = fileSystemViewStore((state) => state.sortOrder);

  return (
    <Box sx={{ ...tableRowBaseSx, bgcolor: "background.paper" }}>
      {tableColumns.map((column) => {
        const { field } = column;

        if (field === "icon") {
          return <Box key={field} sx={{ width: tableIconWidth }} />;
        }

        return (
          <TableHeadCell
            key={field}
            column={column}
            active={field === sortField}
            sortOrder={sortOrder}
            onClick={() => field !== "fileType" && setSorting(field)}
          />
        );
      })}
    </Box>
  );
};

export { TableHeadRow };
