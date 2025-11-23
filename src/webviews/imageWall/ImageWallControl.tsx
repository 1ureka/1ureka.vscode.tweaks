import React, { useState } from "react";
import { Box, Button, Popover, Typography, type PaperProps } from "@mui/material";
import { imageWallPreferenceStore, setImageWallPreference } from "./imageWallPreference";
import type { ImageWallPreferenceState } from "./imageWallPreference";

const layoutOptions: ImageWallPreferenceState["mode"][] = ["standard", "woven", "masonry"];
const layoutTranslations: Record<ImageWallPreferenceState["mode"], string> = {
  standard: "標準",
  woven: "編織",
  masonry: "磚牆",
};

const sizeOptions: ImageWallPreferenceState["columnSize"][] = ["s", "m", "l"];
const sizeTranslations: Record<ImageWallPreferenceState["columnSize"], string> = {
  s: "小",
  m: "中",
  l: "大",
};

const commonPaperProps: PaperProps = {
  sx: { borderRadius: 1, boxShadow: 6, mt: 1 },
  elevation: 0,
};

const Select = <T extends string>({
  label,
  icon,
  value,
  options,
  translations,
  onChange,
  disabled,
}: {
  label: string;
  icon: string;
  value: T;
  options: readonly T[];
  translations: Record<T, string>;
  onChange: (value: T) => void;
  disabled: boolean;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (newValue: T) => {
    onChange(newValue);
    handleClose();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>

      <Button
        variant="contained"
        disableElevation
        onClick={handleClick}
        disabled={disabled}
        startIcon={<span className={`codicon codicon-${icon}`}></span>}
        endIcon={<span className="codicon codicon-chevron-down"></span>}
      >
        {translations[value]}
      </Button>

      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{ paper: commonPaperProps }}
      >
        <Box sx={{ p: 1, display: "flex", flexDirection: "column" }}>
          {options.map((key) => (
            <Button
              key={key}
              onClick={() => handleChange(key)}
              endIcon={value === key ? <span className="codicon codicon-check"></span> : null}
              sx={{ justifyContent: "space-between", p: 0.5, minWidth: 120, color: "text.primary" }}
            >
              {translations[key]}
            </Button>
          ))}
        </Box>
      </Popover>
    </Box>
  );
};

const ModeSelect = ({ disabled }: { disabled: boolean }) => {
  const mode = imageWallPreferenceStore((state) => state.mode);

  return (
    <Select
      label="布局"
      icon="layout"
      value={mode}
      options={layoutOptions}
      translations={layoutTranslations}
      onChange={(newMode) => setImageWallPreference({ mode: newMode })}
      disabled={disabled}
    />
  );
};

const SizeSelect = ({ disabled }: { disabled: boolean }) => {
  const columnSize = imageWallPreferenceStore((state) => state.columnSize);

  return (
    <Select
      label="尺寸"
      icon="symbol-ruler"
      value={columnSize}
      options={sizeOptions}
      translations={sizeTranslations}
      onChange={(newSize) => setImageWallPreference({ columnSize: newSize })}
      disabled={disabled}
    />
  );
};

export { ModeSelect, SizeSelect };
