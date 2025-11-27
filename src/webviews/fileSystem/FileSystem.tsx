import React from "react";
import { Box } from "@mui/material";
// import { fileSystemDataStore } from "./data";
import { FileSystemHeader } from "./FileSystemHeader";
import { FileSystemList } from "./FileSystemList";
// import { FileSystemPagination } from "./FileSystemPagination";

const FileSystem: React.FC = () => {
  //   const pages = fileSystemDataStore((state) => state.pages);

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <FileSystemHeader />
      <FileSystemList />
      {/* {pages > 1 && <FileSystemPagination />} */}
    </Box>
  );
};

export { FileSystem };
