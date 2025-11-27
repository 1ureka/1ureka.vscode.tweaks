import React from "react";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { fileSystemDataStore, navigateToBreadcrumb } from "./data";

const FileSystemBreadcrumb: React.FC = () => {
  const folderPathParts = fileSystemDataStore((state) => state.folderPathParts);

  return (
    <Breadcrumbs aria-label="navigation" separator={<span className="codicon codicon-chevron-right" />}>
      {folderPathParts.map((part, index) => {
        const isLast = index === folderPathParts.length - 1;

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
