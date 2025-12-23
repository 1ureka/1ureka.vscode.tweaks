import { memo, useRef } from "react";
import { Box, Skeleton, SxProps } from "@mui/material";
import { viewDataStore } from "@@/fileSystem/store/data";
import { useVirtualizer } from "@@/fileSystem/layout/imageGridUtils";

// ---------------------------------------------------------------------------------

/**
 *
 */
const scrollContainerSx: SxProps = {
  position: "relative",
  mt: 1,
  flex: 1,
  overflowY: "auto",
  scrollbarGutter: "stable",
};

/**
 *
 */
const virtualGridContainerSx: SxProps = {
  position: "relative",
  "@keyframes fadeIn": { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
  "& > *": {
    position: "absolute",
    p: 0.5,
    animation: "fadeIn 0.15s ease-in-out",
  },
};

// ---------------------------------------------------------------------------------

/**
 *
 */
const ImageGrid = () => {
  const viewMode = viewDataStore((state) => state.viewMode);
  const imageLayout = viewDataStore((state) => state.imageEntries);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { visibleItems, totalHeight } = useVirtualizer({ scrollContainerRef, ...imageLayout });

  if (viewMode !== "images") {
    return null;
  }

  return (
    <Box ref={scrollContainerRef} sx={scrollContainerSx}>
      <Box sx={virtualGridContainerSx} style={{ height: `${totalHeight}px` }}>
        {visibleItems.map((item) => {
          const style = {
            width: item.pixelW,
            height: item.pixelH,
            transform: `translate3d(${item.pixelX}px, ${item.pixelY}px, 0)`,
          };

          return (
            <Box key={item.filePath} style={style}>
              <Skeleton variant="rounded" animation="wave" sx={{ width: 1, height: 1 }} />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

/**
 *
 */
const memoizedImageGrid = memo(ImageGrid);

export { memoizedImageGrid as ImageGrid };
