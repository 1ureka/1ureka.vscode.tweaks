import React from "react";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { fileSystemDataStore, navigateToBreadcrumb } from "./data";

const FileSystemBreadcrumb: React.FC = () => {
  const folderPathParts = fileSystemDataStore((state) => state.folderPathParts);

  return (
    <Breadcrumbs aria-label="navigation" separator={<span className="codicon codicon-chevron-right" />} sx={{ p: 2 }}>
      {folderPathParts.map((part, index) => {
        const isFirst = index === 0;
        const isLast = index === folderPathParts.length - 1;

        if (isFirst) {
          return (
            <Typography key={index} sx={{ color: "text.secondary" }}>
              {part}
            </Typography>
          );
        }

        if (isLast) {
          return (
            <Typography key={index} sx={{ color: "text.primary" }}>
              {part}
            </Typography>
          );
        }

        return (
          <Link
            key={index}
            underline="hover"
            color="inherit"
            onClick={() => navigateToBreadcrumb(index)}
            sx={{ cursor: "pointer" }}
          >
            {part}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export { FileSystemBreadcrumb };
