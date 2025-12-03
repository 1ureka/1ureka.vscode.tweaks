import React from "react";
import { Box, type SxProps } from "@mui/material";
import { OperationBarHeader } from "./FileSystemOpHeader";
import { OperationButton, GroupContainer } from "./FileSystemOpActionEl";

import { fileSystemDataStore } from "../data/data";
import { refresh } from "../data/navigate";
import { fileSystemViewStore, setFilter } from "../data/view";
import { openInWorkspace, openInTerminal, openInImageWall } from "../data/action";

const operationBarContainerSx: SxProps = {
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: 1,
};

const FilterSystemOperationBar = () => {
  const timestamp = fileSystemDataStore((state) => state.timestamp);
  const filter = fileSystemViewStore((state) => state.filter);

  const handleRefresh = () => refresh();
  const handleOpenInWorkspace = () => openInWorkspace();
  const handleOpenInTerminal = () => openInTerminal();
  const handleOpenInImageWall = () => openInImageWall();

  const createHandleFilter = (filter: "all" | "file" | "folder") => {
    return () => setFilter(filter);
  };

  return (
    <Box sx={operationBarContainerSx}>
      <OperationBarHeader />

      <GroupContainer icon="codicon codicon-history" title={`${new Date(timestamp).toLocaleTimeString()}`}>
        <OperationButton icon="codicon codicon-refresh" label="重新整理" onClick={handleRefresh} />
      </GroupContainer>

      <GroupContainer title="篩選...">
        <OperationButton
          active={filter === "all"}
          icon="codicon codicon-file-submodule"
          label="全部"
          onClick={createHandleFilter("all")}
        />
        <OperationButton
          active={filter === "file"}
          icon="codicon codicon-file"
          label="僅限檔案"
          onClick={createHandleFilter("file")}
        />
        <OperationButton
          active={filter === "folder"}
          icon="codicon codicon-folder"
          label="僅限資料夾"
          onClick={createHandleFilter("folder")}
        />
      </GroupContainer>

      <GroupContainer title="在此開啟...">
        <OperationButton icon="codicon codicon-window" label="新工作區" onClick={handleOpenInWorkspace} />
        <OperationButton icon="codicon codicon-terminal" label="終端機" onClick={handleOpenInTerminal} />
        <OperationButton icon="codicon codicon-folder-library" label="圖片牆" onClick={handleOpenInImageWall} />
      </GroupContainer>
    </Box>
  );
};

export { FilterSystemOperationBar };
