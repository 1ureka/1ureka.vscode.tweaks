import React from "react";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { fileSystemDataStore } from "../data/data";
import { navigateToBreadcrumb } from "../data/navigate";

const FileSystemBreadcrumb: React.FC = () => {
  const currentPathParts = fileSystemDataStore((state) => state.currentPathParts);

  return (
    <Breadcrumbs
      aria-label="navigation"
      separator={<span className="codicon codicon-chevron-right" />}
      sx={{ "& .MuiBreadcrumbs-separator": { mx: 0.5 } }}
    >
      {currentPathParts.map((part, index) => {
        const isLast = index === currentPathParts.length - 1;

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
