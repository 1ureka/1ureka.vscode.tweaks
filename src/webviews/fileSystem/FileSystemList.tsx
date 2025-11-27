import React from "react";
import { Box, ButtonBase, type SxProps, Typography } from "@mui/material";
import { fileSystemDataStore } from "./data";
import type { FileProperties } from "../../handlers/fileSystemHandlers";
import { ellipsisSx } from "../utils/Providers";

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
  const colorSx: SxProps = variant === "primary" ? { color: "text.primary" } : { color: "text.secondary" };
  return (
    <Typography variant="body2" sx={{ ...colorSx, ...ellipsisSx }}>
      {text}
    </Typography>
  );
};

const FileSystemList = () => {
  const files = fileSystemDataStore((state) => state.files);
  const gridTemplateColumns = "auto 1fr repeat(4, auto)";

  const headers = [
    { align: "left", text: "" },
    { align: "left", text: "名稱" },
    { align: "right", text: "類型" },
    { align: "right", text: "修改日期" },
    { align: "right", text: "建立日期" },
    { align: "right", text: "大小" },
  ] as const;

  return (
    <Box sx={{ position: "relative" }}>
      <Box sx={{ display: "grid", gridTemplateColumns, px: 2, placeItems: "stretch", gap: 0.5 }}>
        {headers.map(({ align, text }) => (
          <FileSystemListCell key={text} align={align}>
            <FileSystemListCellText text={text} variant="primary" />
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
              <FileSystemListCellText text={new Date(mtime).toLocaleDateString()} />
            </FileSystemListCell>

            <FileSystemListCell>
              <FileSystemListCellText text={new Date(ctime).toLocaleDateString()} />
            </FileSystemListCell>

            <FileSystemListCell>{size > 0 && <FileSystemListCellText text={fileSize} />}</FileSystemListCell>
          </React.Fragment>
        ))}
      </Box>

      <Box sx={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr", px: 2, gap: 0.5 }}>
        <Box sx={{ bgcolor: "background.paper", borderRadius: 1 }} /> {/* Header spacer */}
        {files.map(({ fileName }, i) => (
          <ButtonBase key={fileName} sx={{ borderRadius: 1, bgcolor: i % 2 !== 0 ? "#ffffff07" : "transparent" }}>
            {/* Empty ButtonBase to make the entire row clickable */}
          </ButtonBase>
        ))}
      </Box>
    </Box>
  );
};

export { FileSystemList };
