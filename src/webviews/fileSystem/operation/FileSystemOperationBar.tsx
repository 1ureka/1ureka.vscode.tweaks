import React from "react";
import { Box, type SxProps } from "@mui/material";
import { OperationBarHeader } from "./FileSystemOpHeader";
import { OperationButton, GroupContainer } from "./FileSystemOpActionEl";

import { fileSystemDataStore } from "../data";
import { refresh, setFilter } from "../navigate";
import { createNewFile, createNewFolder } from "../action";

const operationBarContainerSx: SxProps = {
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: 1,
};

const FilterSystemOperationBar = () => {
  const timestamp = fileSystemDataStore((state) => state.timestamp);
  const filter = fileSystemDataStore((state) => state.filter);

  const handleRefresh = () => refresh();
  const handleCreateNewFolder = () => createNewFolder();
  const handleCreateNewFile = () => createNewFile();

  const createHandleFilter = (filter: "all" | "files" | "folders") => {
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
          active={filter === "files"}
          icon="codicon codicon-file"
          label="僅限檔案"
          onClick={createHandleFilter("files")}
        />
        <OperationButton
          active={filter === "folders"}
          icon="codicon codicon-folder"
          label="僅限資料夾"
          onClick={createHandleFilter("folders")}
        />
      </GroupContainer>

      <GroupContainer title="操作...">
        <OperationButton icon="codicon codicon-new-folder" label="新增資料夾" onClick={handleCreateNewFolder} />
        <OperationButton icon="codicon codicon-new-file" label="新增檔案" onClick={handleCreateNewFile} />
      </GroupContainer>

      <GroupContainer title="在此開啟...">
        <OperationButton icon="codicon codicon-window" label="新工作區" />
        <OperationButton icon="codicon codicon-terminal" label="終端機" />
        <OperationButton icon="codicon codicon-folder-library" label="圖片牆" />
      </GroupContainer>
    </Box>
  );
};

export { FilterSystemOperationBar };
