import { colorMix } from "@/utils/ui";
import { Box, Checkbox, FormControlLabel, ButtonBase } from "@mui/material";
import type { SxProps } from "@mui/material";

const PropBooleanSx: SxProps = {
  display: "flex",
  alignItems: "center",
  m: 0,
  gap: 0.25,

  "& .MuiCheckbox-root": {
    display: "grid",
    placeItems: "center",
    height: 1,
    aspectRatio: "1 / 1",
    position: "relative",
    "& > svg": { position: "absolute", fontSize: "16px" },
  },

  "& .MuiTypography-root": {
    fontSize: "0.75rem",
    lineHeight: 1.5,
  },
};

type PropBooleanProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

const PropBoolean = ({ label, value, onChange, disabled }: PropBooleanProps) => {
  return (
    <FormControlLabel
      sx={PropBooleanSx}
      label={label}
      control={
        <Checkbox size="small" checked={value} onChange={(_, checked) => onChange(checked)} disabled={disabled} />
      }
    />
  );
};

// ------------------------------------------------------------------------------

const PropEnumSx: SxProps = {
  display: "flex",
  alignItems: "stretch",
  flexDirection: "column",

  overflow: "hidden",
  borderRadius: 1,
  border: "2px solid",
  borderColor: "action.border",
  "& > button": { border: "none", borderTop: "2px solid", borderColor: "action.border" },
  "& > button:first-child": { borderTop: "none" },

  "& > button.MuiButtonBase-root": {
    px: 1,
    justifyContent: "flex-start",
    fontSize: "0.75rem",
    lineHeight: 1.5,

    bgcolor: "action.button",
    "&:hover": { bgcolor: colorMix("action.button", "text.primary", 0.9) },
    "&:active": { bgcolor: "action.active" },

    "&.selected": {
      bgcolor: "action.active",
      "&:hover": { bgcolor: "action.active" },
      "&:active": { bgcolor: "action.active" },
    },
  },
};

type PropEnumProps<T extends React.Key = never> = {
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
  disabled?: boolean;
};

const PropEnum = <T extends React.Key>({ value, options, onChange, disabled }: PropEnumProps<T>) => {
  return (
    <Box sx={PropEnumSx}>
      {options.map((option) => (
        <ButtonBase
          key={option.value}
          className={option.value === value ? "selected" : ""}
          disabled={disabled}
          onClick={() => onChange(option.value)}
          disableRipple
        >
          {option.label}
        </ButtonBase>
      ))}
    </Box>
  );
};

export { PropBoolean, PropEnum };
