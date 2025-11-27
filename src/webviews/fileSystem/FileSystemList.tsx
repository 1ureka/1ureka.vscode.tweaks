import React from "react";
import { Box, ButtonBase, type SxProps, Typography } from "@mui/material";
import { fileSystemDataStore } from "./data";
import type { FileProperties } from "../../handlers/fileSystemHandlers";

const fileTypeDisplayMap: Record<FileProperties["fileType"], string> = {
  file: "檔案",
  folder: "資料夾",
  "symbolic-link-file": "符號連結檔案",
  "symbolic-link-folder": "符號連結資料夾",
};

type FileSystemListCellProps = {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
};

const FileSystemListCell = ({ children, align = "right" }: FileSystemListCellProps) => {
  return <Box sx={{ px: 2, py: 1, display: "grid", alignItems: "center", justifyContent: align }}>{children}</Box>;
};

type FileSystemListCellTextProps = {
  text: string;
  variant?: "primary" | "secondary";
};

const FileSystemListCellText = ({ text, variant = "secondary" }: FileSystemListCellTextProps) => {
  const sx: SxProps = variant === "primary" ? { color: "text.primary" } : { color: "text.secondary" };
  return (
    <Typography variant="body2" sx={sx}>
      {text}
    </Typography>
  );
};

export const FileSystemList: React.FC = () => {
  const files = fileSystemDataStore((state) => state.files);
  const gridTemplateColumns = "auto 1fr repeat(4, auto)";

  return (
    <Box sx={{ position: "relative" }}>
      <Box sx={{ display: "grid", gridTemplateColumns, px: 2, placeItems: "stretch" }}>
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
              <FileSystemListCellText text={new Date(mtime).toLocaleDateString()} />
            </FileSystemListCell>

            <FileSystemListCell>
              <FileSystemListCellText text={new Date(ctime).toLocaleDateString()} />
            </FileSystemListCell>

            <FileSystemListCell>{size > 0 && <FileSystemListCellText text={fileSize} />}</FileSystemListCell>
          </React.Fragment>
        ))}
      </Box>

      <Box sx={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr", px: 2 }}>
        {files.map(({ fileName }, i) => (
          <ButtonBase key={fileName} sx={{ borderRadius: 1, bgcolor: i % 2 !== 0 ? "#ffffff07" : "transparent" }}>
            {/* Empty ButtonBase to make the entire row clickable */}
          </ButtonBase>
        ))}
      </Box>
    </Box>
  );
};
