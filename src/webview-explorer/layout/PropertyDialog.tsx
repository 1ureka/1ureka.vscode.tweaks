import { memo } from "react";
import { Dialog } from "@explorer/components/Dialog";
import { Box, type SxProps } from "@mui/material";
import { ActionButton, ActionGroup, ActionInput } from "@explorer/components/Action";

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
    border: "none",
    height: "1px",
    bgcolor: "divider",
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

const PropertyDialog = memo((props: { open: boolean; onClose: () => void }) => {
  const { open, onClose } = props;

  return (
    <Dialog open={open} onClose={onClose}>
      <Box sx={propertyDialogSx}>
        <div className={className.header}>
          <i className="codicon codicon-info" />

          <div className={className.groupContainer}>
            <p className={className.groupLabel}>名稱:</p>
            <p className={className.groupValue}>1ureka-vscode-extension-0.5.22.vsix</p>

            <p className={className.groupLabel}>類型:</p>
            <p className={className.groupValue}>VSIX 檔案</p>
          </div>
        </div>

        <hr className={className.divider} />

        <div className={className.groupContainer}>
          <p className={className.groupLabel}>路徑:</p>
          <ActionGroup>
            <ActionInput
              readOnly
              actionName="檔案路徑"
              value="C:\Users\Summe\Desktop\npm projects\1ureka.vscode.extension\1ureka-vscode-extension-0.5.22.vsix"
            />
            <ActionButton
              actionIcon="codicon codicon-copy"
              actionName="複製路徑"
              actionDetail="將檔案路徑複製到剪貼簿"
              onClick={() => {}}
            />
          </ActionGroup>

          <p className={className.groupLabel}>建立時間:</p>
          <p className={className.groupValue}>2024/06/15 14:30:00</p>

          <p className={className.groupLabel}>修改時間:</p>
          <p className={className.groupValue}>2024/06/20 10:15:00</p>
        </div>
      </Box>
    </Dialog>
  );
});

export { PropertyDialog };
