import React from "react";
import { Box, type BoxProps, ButtonBase, type SxProps, Typography } from "@mui/material";
import { ellipsisSx } from "../utils/Providers";
import { fileSystemDataStore } from "./data";
import { navigateToFile, navigateToFolder, navigateUp, setSorting } from "./navigate";
import type { FileProperties } from "../../handlers/fileSystemHandlers";

const fileTypeDisplayMap: Record<FileProperties["fileType"], string> = {
  file: "檔案",
  folder: "資料夾",
  "file-symlink-file": "符號連結檔案",
  "file-symlink-directory": "符號連結資料夾",
};

type FileSystemListCellProps = {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
} & BoxProps;

const FileSystemListCell = ({ children, align = "right", sx, ...rest }: FileSystemListCellProps) => {
  return (
    <Box sx={{ px: 2, py: 1, display: "grid", alignItems: "center", justifyContent: align, ...sx }} {...rest}>
      {children}
    </Box>
  );
};

type FileSystemListCellTextProps = {
  text: string;
  variant?: "primary" | "secondary";
};

const FileSystemListCellText = ({ text, variant = "secondary" }: FileSystemListCellTextProps) => {
  const colorSx: SxProps = variant === "primary" ? { color: "text.primary" } : { color: "text.secondary" };
  return (
    <Typography variant="body2" sx={{ ...colorSx, ...ellipsisSx }}>
      {text}
    </Typography>
  );
};

const FileSystemList = () => {
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

  const headers = [
    { align: "left", text: "", sortField: "" },
    { align: "left", text: "名稱", sortField: "fileName" },
    { align: "right", text: "類型", sortField: "" },
    { align: "right", text: "修改日期", sortField: "mtime" },
    { align: "right", text: "建立日期", sortField: "ctime" },
    { align: "right", text: "大小", sortField: "size" },
  ] as const;

  const containerShareSx: SxProps = { display: "grid", px: 2, gap: 0.5 };
  const containerSx: Record<string, SxProps> = {
    itemIsFullWidth: { position: "absolute", inset: 0, gridTemplateColumns: "1fr", ...containerShareSx },
    itemIsCell: { position: "relative", gridTemplateColumns, placeItems: "stretch", ...containerShareSx },
  };

  return (
    <Box sx={{ position: "relative" }}>
      {/* 每個項目的背景樣式區 */}
      <Box sx={containerSx.itemIsFullWidth}>
        <Box sx={{ bgcolor: "background.paper", borderRadius: 1 }} /> {/* Header background */}
        {!root && <Box sx={{ borderRadius: 1, bgcolor: "table.alternateRowBackground" }} />}{" "}
        {/* Spacer for prev folder navigation */}
        {files.map(({ fileName }, i) => (
          <Box
            key={fileName}
            sx={{ borderRadius: 1, bgcolor: i % 2 !== 0 ? "table.alternateRowBackground" : "transparent" }}
          />
        ))}
      </Box>

      {/* 每個項目的實際內容，包括 header 的可點擊區 */}
      <Box sx={containerSx.itemIsCell}>
        {headers.map(({ align, text, sortField: headerSortField }) => (
          <FileSystemListCell
            key={text}
            align={align}
            onClick={() => headerSortField && setSorting(headerSortField)}
            sx={{
              cursor: headerSortField ? "pointer" : "default",
              gap: 0.5,
              gridAutoFlow: "column",
              userSelect: "none",
              "&:hover > span.codicon": { color: sortField === headerSortField ? "text.primary" : "text.secondary" },
              "& > span.codicon": { color: sortField === headerSortField ? "text.secondary" : "transparent" },
            }}
          >
            <FileSystemListCellText text={text} variant={headerSortField ? "primary" : "secondary"} />
            {headerSortField && <span className={`codicon codicon-arrow-${sortOrder === "asc" ? "up" : "down"}`} />}
          </FileSystemListCell>
        ))}

        {/* 回到上層資料夾 */}
        {!root &&
          Array(6)
            .fill(null)
            .map((_, i) => (
              <FileSystemListCell key={i} align={i === 0 || i === 1 ? "left" : "right"}>
                {i === 0 ? (
                  <span className={"codicon codicon-folder-opened"} style={{ display: "flex", alignItems: "center" }} />
                ) : i === 1 ? (
                  <FileSystemListCellText text={".."} variant="primary" />
                ) : (
                  <Box />
                )}
              </FileSystemListCell>
            ))}

        {files.map(({ icon, fileName, fileType, fileSize, mtime, ctime, size }) => (
          <React.Fragment key={fileName}>
            <FileSystemListCell align="left">
              <span className={icon} style={{ display: "flex", alignItems: "center" }}></span>
            </FileSystemListCell>

            <FileSystemListCell align="left">
              <FileSystemListCellText text={fileName} variant="primary" />
            </FileSystemListCell>

            <FileSystemListCell>
              <FileSystemListCellText text={fileTypeDisplayMap[fileType]} />
            </FileSystemListCell>

            <FileSystemListCell>
              <FileSystemListCellText text={new Date(mtime).toLocaleString()} />
            </FileSystemListCell>

            <FileSystemListCell>
              <FileSystemListCellText text={new Date(ctime).toLocaleDateString()} />
            </FileSystemListCell>

            <FileSystemListCell>{size > 0 && <FileSystemListCellText text={fileSize} />}</FileSystemListCell>
          </React.Fragment>
        ))}
      </Box>

      {/* 每個 row 的可點擊區，除了 header */}
      <Box sx={{ ...containerSx.itemIsFullWidth, pointerEvents: "none" }}>
        <Box /> {/* Header spacer */}
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

export { FileSystemList };
