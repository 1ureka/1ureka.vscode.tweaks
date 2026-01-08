import { memo, Suspense } from "react";
import { Box, type SxProps } from "@mui/material";

import { Dialog } from "@explorer/components/Dialog";
import { ActionButton, ActionGroup, ActionInput } from "@explorer/components/Action";
import { selectionStore, viewDataStore } from "@explorer/store/data";
import { fileAttributesCache } from "@explorer/store/cache";

import type { InspectDirectoryEntry } from "@/utils/host/system";
import { formatFileSize, formatFileType, formatFixedLengthDateTime } from "@/utils/shared/formatter";
import { extensionIconMap } from "@/assets/fileExtMap";

/**
 * 為項目指派對應的圖示
 */
const assignIcon = (entry: InspectDirectoryEntry) => {
  let icon: `codicon codicon-${string}` = `codicon codicon-${entry.fileType}`;

  if (entry.fileType !== "file") return icon;

  const fileName = entry.fileName.toLowerCase();
  const extension = fileName.includes(".") ? fileName.split(".").pop() || "" : "";

  return extensionIconMap[extension] ?? icon;
};

/**
 * ?
 */
const useLastSelectedItem = () => {
  const lastSelectedIndex = selectionStore((state) => state.lastSelectedIndex);
  const rows = viewDataStore((state) => state.entries);
  const selectedItem = lastSelectedIndex !== null ? rows[lastSelectedIndex] : null;

  return selectedItem;
};

// ---------------------------------------------------------------------------------

const rowHeight = 32;

const className = {
  header: "property-dialog-header",
  divider: "property-dialog-divider",
  groupContainer: "property-dialog-group-container",
  groupLabel: "property-dialog-group-label",
  groupValue: "property-dialog-group-value",
} as const;

const propertyDialogSx: SxProps = {
  display: "flex",
  flexDirection: "column",
  p: 2,

  [`& > .${className.header}`]: {
    height: 2 * rowHeight,
    display: "grid",
    gridTemplateColumns: "auto 1fr",
  },

  [`& > .${className.header} > .codicon[class*='codicon-']`]: {
    display: "grid",
    placeItems: "center",
    height: 2 * rowHeight,
    aspectRatio: "1 / 1",
    fontSize: rowHeight,
    mr: 1,
    bgcolor: "background.paper",
    borderRadius: 1,
  },

  [`& > hr.${className.divider}`]: {
    borderTop: "1px solid",
    borderColor: "divider",
    opacity: 0.75,
    my: 1,
    width: 1,
  },

  [`& .${className.groupContainer}`]: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    alignItems: "center",
    columnGap: 1,
  },

  [`& p`]: {
    typography: "body2",
    height: rowHeight,
    lineHeight: `${rowHeight}px`,
    minWidth: 0,
    overflow: "hidden",
    whiteSpace: "pre",
    textOverflow: "ellipsis",
    m: 0,
  },

  [`& p.${className.groupLabel}`]: {
    color: "text.secondary",
    minWidth: "max-content",
  },
};

const FileAttributes = () => {
  const selectedItem = useLastSelectedItem();

  if (!selectedItem) {
    return null;
  }

  const attributes = fileAttributesCache.get(selectedItem.filePath).read();
  let displayAttributes = "無法取得屬性";
  if (attributes) {
    displayAttributes = attributes.join(", ");
  }

  return <p className={className.groupValue}>{displayAttributes}</p>;
};

const FileProps = () => {
  const selectedItem = useLastSelectedItem();

  if (!selectedItem) {
    return null;
  }

  return (
    <div className={className.groupContainer}>
      <p className={className.groupLabel}>檔案大小:</p>
      <p className={className.groupValue} style={{ whiteSpace: "normal" }}>
        {formatFileSize(selectedItem.size)}
      </p>

      <p className={className.groupLabel}>檔案屬性:</p>
      <Suspense fallback={<p className={className.groupValue}>載入中...</p>}>
        <FileAttributes />
      </Suspense>
    </div>
  );
};

const PropertyDialog = memo(({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const selectedItem = useLastSelectedItem();

  if (!selectedItem) {
    return null;
  }

  let type: "file" | "dir" | "other" = "other";
  if (selectedItem.fileType === "file") type = "file";
  if (selectedItem.fileType === "folder") type = "dir";

  return (
    <Dialog open={open} onClose={onClose}>
      <Box sx={propertyDialogSx}>
        <div className={className.header}>
          <i className={assignIcon(selectedItem)} />

          <div className={className.groupContainer}>
            <p className={className.groupLabel}>名稱:</p>
            <p className={className.groupValue}>{selectedItem.fileName}</p>

            <p className={className.groupLabel}>類型:</p>
            <p className={className.groupValue}>{formatFileType(selectedItem)}</p>
          </div>
        </div>

        <hr className={className.divider} />

        <div className={className.groupContainer}>
          <p className={className.groupLabel}>路徑:</p>
          <ActionGroup>
            <ActionInput readOnly actionName="檔案路徑" value={selectedItem.filePath} />
            <ActionButton
              actionIcon="codicon codicon-copy"
              actionName="複製路徑"
              actionDetail="將檔案路徑複製到剪貼簿"
              onClick={() => {}}
            />
          </ActionGroup>

          <p className={className.groupLabel}>建立時間:</p>
          <p className={className.groupValue}>{formatFixedLengthDateTime(new Date(selectedItem.ctime))}</p>

          <p className={className.groupLabel}>修改時間:</p>
          <p className={className.groupValue}>{formatFixedLengthDateTime(new Date(selectedItem.mtime))}</p>
        </div>

        {type !== "other" && <hr className={className.divider} />}

        {type === "file" && <FileProps />}

        {type === "dir" && <></>}
      </Box>

      <Box sx={{ position: "absolute", inset: "0px 0px auto auto", p: 1.5 }}>
        <ActionGroup size="small">
          <ActionButton actionIcon="codicon codicon-close" actionName="關閉" onClick={onClose} />
        </ActionGroup>
      </Box>
    </Dialog>
  );
});

export { PropertyDialog };
