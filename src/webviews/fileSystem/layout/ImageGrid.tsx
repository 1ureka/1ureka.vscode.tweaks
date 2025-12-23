import { memo, Suspense, useRef } from "react";
import { Box, keyframes, SxProps } from "@mui/material";
import { viewDataStore } from "@@/fileSystem/store/data";
import { useVirtualizer } from "@@/fileSystem/layout/imageGridUtils";
import { thumbnailCache } from "@@/fileSystem/action/images";

// ---------------------------------------------------------------------------------

/** 滾動容器樣式，確保卷軸穩定性並填滿可用空間 */
const scrollContainerSx: SxProps = {
  position: "relative",
  mt: 1,
  flex: 1,
  overflowY: "auto",
  scrollbarGutter: "stable",
};

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

/** 透過樣式委派統一控制虛擬元素、Fallback(div) 與實體圖片的過渡效果 */
const virtualGridContainerSx: SxProps = {
  position: "relative",

  // 虛擬元素容器
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
 * 圖片虛擬網格主組件
 * 結合虛擬捲動、Suspense 非同步載入與樣式委派
 */
const ImageGrid = memo(() => {
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
            <div key={item.filePath} style={style}>
              <Suspense fallback={<div />}>
                <ImageGridItem filePath={item.filePath} />
              </Suspense>
            </div>
          );
        })}
      </Box>
    </Box>
  );
});

export { ImageGrid };
