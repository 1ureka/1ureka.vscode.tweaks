import { colorMix } from "@/utils/ui";
import { Box, Checkbox, FormControlLabel, ButtonBase } from "@mui/material";

type PropBooleanProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

const PropBoolean = (props: PropBooleanProps) => {
  const { label, value, onChange, disabled = false } = props;

  return (
    <FormControlLabel
      sx={{ display: "flex", alignItems: "center", m: 0, gap: 0.25, "& .MuiTypography-root": { fontSize: "0.75rem" } }}
      control={
        <Checkbox
          size="small"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          sx={{
            display: "grid",
            placeItems: "center",
            height: 1,
            aspectRatio: "1 / 1",
            position: "relative",
            "& > svg": { position: "absolute", fontSize: "16px" },
          }}
        />
      }
      label={label}
    />
  );
};

type PropEnumProps<T extends React.Key = never> = {
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
  disabled?: boolean;
};

const PropEnum = <T extends React.Key>(props: PropEnumProps<T>) => {
  const { value, options, onChange, disabled = false } = props;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "stretch",
        flexDirection: "column",

        overflow: "hidden",
        borderRadius: 1,
        border: "2px solid",
        borderColor: "action.border",
        [`& > button`]: { border: "none", borderTop: "2px solid", borderColor: "action.border" },
        [`& > button:first-child`]: { borderTop: "none" },
      }}
    >
      {options.map((option) => (
        <ButtonBase
          key={option.value}
          disabled={disabled}
          onClick={() => onChange(option.value)}
          disableRipple
          sx={{
            px: 1,
            justifyContent: "flex-start",
            fontSize: "0.75rem",
            lineHeight: 1.5,
            bgcolor: option.value === value ? "action.active" : "action.button",
            "&:hover": {
              bgcolor: option.value === value ? "action.active" : colorMix("action.button", "text.primary", 0.9),
            },
            "&:active": { bgcolor: "action.active" },
          }}
        >
          {option.label}
        </ButtonBase>
      ))}
    </Box>
  );
};

export { PropBoolean, PropEnum };
