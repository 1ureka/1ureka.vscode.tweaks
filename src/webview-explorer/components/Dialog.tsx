import { memo } from "react";
import { Dialog as MuiDialog } from "@mui/material";

const Dialog = memo((props: { open: boolean; onClose: () => void; children: React.ReactNode }) => {
  const { open, onClose, children } = props;

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      fullWidth
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            bgcolor: "tooltip.background",
            border: "1px solid",
            borderColor: "tooltip.border",
            boxShadow: "0 4px 16px var(--vscode-widget-shadow)",
            borderRadius: 1,
          },
        },
        backdrop: {
          sx: { bgcolor: "rgba(0, 0, 0, 0.25)" },
        },
      }}
    >
      {children}
    </MuiDialog>
  );
});

export { Dialog };
