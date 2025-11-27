import React from "react";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { fileSystemDataStore } from "./data";
import { navigateToBreadcrumb } from "./navigate";

const FileSystemBreadcrumb: React.FC = () => {
  const folderPathParts = fileSystemDataStore((state) => state.folderPathParts);

  return (
    <Breadcrumbs
      aria-label="navigation"
      separator={<span className="codicon codicon-chevron-right" />}
      sx={{ "& .MuiBreadcrumbs-separator": { mx: 0.5 } }}
    >
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
