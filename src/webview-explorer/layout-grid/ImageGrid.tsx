import { memo, Suspense, useRef } from "react";
import { Box, keyframes, SxProps } from "@mui/material";
import { viewDataStore } from "@explorer/store/data";
import { useVirtualizer } from "@explorer/layout-grid/imageGridUtils";
import { thumbnailCache } from "@explorer/store/cache";

const scrollContainerClassName = "image-grid-scroll-container";
const virtualItemsContainerClassName = "image-grid-virtual-items-container";

// ---------------------------------------------------------------------------------

/** 圖片進場淡入動畫 */
const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

/** 背景流光動畫，模擬骨架屏載入質感 */
const shimmer = keyframes`
  0% { background-position: -200%; }
  100% { background-position: 200%; }
`;

/** 骨架屏背景顏色 */
const skeletonBgColor = "var(--mui-palette-background-paper)";
const skeletonHighlightColor =
  "color-mix(in srgb, var(--mui-palette-background-paper) 80%, var(--mui-palette-text-primary) 20%)";

// ---------------------------------------------------------------------------------

/**
 * 整個圖片網格組件的所有樣式，透過樣式委派傳遞
 */
const imageGridSx: SxProps = {
  position: "relative",
  p: 1.5,
  pr: 0, // 右側不留空間給 scrollContainer 做捲軸
  flex: 1,
  minHeight: 0,
  borderRadius: 1,
  bgcolor: "background.content",

  [`& .${scrollContainerClassName}`]: {
    position: "relative",
    height: 1,
    minHeight: 0,
    overflowY: "auto",
    scrollbarGutter: "stable",
  },

  [`& .${virtualItemsContainerClassName}`]: {
    position: "relative",

    // 虛擬項目容器
    "& > *": { position: "absolute", p: 0.5 },

    // 虛擬元素本體 (圖片或 fallback)
    "& > * > *": {
      borderRadius: 0.5,
      background: `linear-gradient(90deg, ${skeletonBgColor} 25%, ${skeletonHighlightColor} 50%, ${skeletonBgColor} 75%)`,
      backgroundSize: "200% 100%",
      animation: `${fadeIn} 0.25s cubic-bezier(0, 0, 0.2, 1) forwards, ${shimmer} 2s linear infinite`,
      width: 1,
      height: 1,
      objectFit: "cover",
    },
  },
};

// ---------------------------------------------------------------------------------

/**
 * 單一圖片組件，串接 Suspense-ready 資源
 */
const ImageGridItem = memo(({ filePath }: { filePath: string }) => {
  const data = thumbnailCache.get(filePath).read();
  return <img src={data} draggable={false} />;
});

/**
 * 圖片虛擬網格，結合虛擬捲動、Suspense 非同步載入
 */
const ImageVirtualGrid = memo(() => {
  const imageLayout = viewDataStore((state) => state.imageEntries);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { visibleItems, totalHeight } = useVirtualizer({ scrollContainerRef, ...imageLayout });

  return (
    <div className={scrollContainerClassName} ref={scrollContainerRef}>
      <div className={virtualItemsContainerClassName} style={{ height: `${totalHeight}px` }}>
        {visibleItems.map((item) => {
          const style = {
            width: item.pixelW,
            height: item.pixelH,
            transform: `translate3d(${item.pixelX}px, ${item.pixelY}px, 0)`,
          };

          return (
            <div key={item.filePath} style={style}>
              <Suspense fallback={<div />}>
                <ImageGridItem filePath={item.filePath} />
              </Suspense>
            </div>
          );
        })}
      </div>
    </div>
  );
});

/**
 * 圖片網格組件，結合虛擬捲動、Suspense 非同步載入與樣式委派
 */
const ImageGrid = memo(() => {
  const viewMode = viewDataStore((state) => state.viewMode);

  if (viewMode !== "images") {
    return null;
  }

  return (
    <Box sx={imageGridSx}>
      <ImageVirtualGrid />
    </Box>
  );
});

export { ImageGrid };
