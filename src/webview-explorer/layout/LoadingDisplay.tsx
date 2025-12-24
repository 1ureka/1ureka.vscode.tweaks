import { loadingStore } from "@explorer/store/queue";
import { Box, LinearProgress } from "@mui/material";
import { memo } from "react";

const loadingContainerSx = {
  position: "absolute",
  inset: "0",
  pointerEvents: "none",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "stretch",
  animation: "progressDelay 0.15s steps(1, end)",
  "@keyframes progressDelay": {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
};

const LoadingDisplay = memo(() => {
  const loading = loadingStore((state) => state.loading);

  if (!loading) return null;

  return (
    <Box sx={loadingContainerSx}>
      <LinearProgress sx={{ width: 1, height: 6 }} color="info" />
    </Box>
  );
});

export { LoadingDisplay };
