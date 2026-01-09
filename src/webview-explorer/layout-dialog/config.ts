import type { SxProps } from "@mui/material";

/** ? */
const rowHeight = 32;

/** ? */
const propertyDialogClassName = {
  header: "property-dialog-header",
  divider: "property-dialog-divider",
  groupContainer: "property-dialog-group-container",
  groupLabel: "property-dialog-group-label",
  groupValue: "property-dialog-group-value",
} as const;

/**
 * ?
 */
const propertyDialogSx: SxProps = {
  display: "flex",
  flexDirection: "column",
  p: 2,

  [`& > .${propertyDialogClassName.header}`]: {
    height: 2 * rowHeight,
    display: "grid",
    gridTemplateColumns: "auto 1fr",
  },

  [`& > .${propertyDialogClassName.header} > .codicon[class*='codicon-']`]: {
    display: "grid",
    placeItems: "center",
    height: 2 * rowHeight,
    aspectRatio: "1 / 1",
    fontSize: rowHeight,
    mr: 1,
    bgcolor: "background.paper",
    borderRadius: 1,
  },

  [`& > hr.${propertyDialogClassName.divider}`]: {
    borderTop: "1px solid",
    borderColor: "divider",
    opacity: 0.75,
    my: 1,
    width: 1,
  },

  [`& .${propertyDialogClassName.groupContainer}`]: {
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

  [`& p.${propertyDialogClassName.groupLabel}`]: {
    color: "text.secondary",
    minWidth: "max-content",
  },
};

export { propertyDialogSx, propertyDialogClassName, rowHeight };
