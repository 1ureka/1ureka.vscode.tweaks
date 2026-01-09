import { memo, Suspense } from "react";
import { Box } from "@mui/material";

import { Dialog } from "@explorer/components/Dialog";
import { propertyDialogSx, propertyDialogClassName, rowHeight } from "@explorer/layout-dialog/config";
import { ActionButton, ActionGroup, ActionInput } from "@explorer/components/Action";
import { selectionStore, viewDataStore } from "@explorer/store/data";
import { fileAttributesCache, fileAvailabilityCache } from "@explorer/store/cache";
import { writeSystemClipboard } from "@explorer/action/clipboard";

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

/**
 * ?
 */
const className = propertyDialogClassName;

/**
 * ?
 */
const FileAttributes = () => {
  const selectedItem = useLastSelectedItem();
  if (!selectedItem) return null;

  const attributes = fileAttributesCache.get(selectedItem.filePath).read();
  let displayAttributes = "無法取得屬性";
  if (attributes) displayAttributes = attributes.join(", ");

  return <p className={className.groupValue}>{displayAttributes}</p>;
};

/**
 * ?
 */
const FileAvailability = () => {
  const selectedItem = useLastSelectedItem();
  if (!selectedItem) return null;

  const availability = fileAvailabilityCache.get(selectedItem.filePath).read();
  let displayAvailability = "無法取得狀態";
  if (availability === "Normal") displayAvailability = "本機可用";
  if (availability === "OnlineOnly") displayAvailability = "連線時可用";
  if (availability === "AlwaysAvailable") displayAvailability = "在此裝置上永遠可用";
  if (availability === "LocallyAvailable") displayAvailability = "在此裝置上可用";

  let icon: `codicon codicon-${string}` | null = null;
  if (availability === "OnlineOnly") icon = "codicon codicon-cloud";
  if (availability === "AlwaysAvailable") icon = "codicon codicon-pass-filled";
  if (availability === "LocallyAvailable") icon = "codicon codicon-pass";

  return (
    <p className={className.groupValue} style={{ display: "flex", alignItems: "center" }}>
      {icon && <i className={icon} style={{ marginRight: 4, lineHeight: `${rowHeight}px` }} />}
      {displayAvailability}
    </p>
  );
};

/**
 * ?
 */
const FileProps = memo(() => {
  const selectedItem = useLastSelectedItem();
  if (!selectedItem) return null;

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
      <p className={className.groupLabel}>可用性狀態:</p>
      <Suspense fallback={<p className={className.groupValue}>載入中...</p>}>
        <FileAvailability />
      </Suspense>
    </div>
  );
});

// ---------------------------------------------------------------------------------

/**
 * ?
 */
const PropertyDialog = memo(({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const selectedItem = useLastSelectedItem();

  if (!selectedItem) return null;

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
              onClick={() => writeSystemClipboard("path")}
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
