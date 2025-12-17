import { colorMix, startReactApp } from "@/utils/ui";

import { registerInitData } from "@@/fileSystem/data/data";
import { registerSelectionEvents } from "@@/fileSystem/data/selection";
import { registerNavigateShortcuts } from "@@/fileSystem/data/navigate";
import { registerMessageEvents } from "@@/fileSystem/data/message";
import { registerClipboardEvents } from "@@/fileSystem/data/clipboard";

import { Box } from "@mui/material";
import { NavigationPanels } from "@@/fileSystem/layout/NavigationPanels";
import { NavigationBar } from "@@/fileSystem/layout/NavigationBar";
import { TableHead } from "@@/fileSystem/layout/TableHead";
import { tableRowHeight } from "@@/fileSystem/layout/tableConfig";
import { useRef } from "react";

const Container = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ height: "100dvh", width: "100dvw", overflow: "hidden", overflowX: "auto" }}>
    <Box sx={{ minWidth: 850, display: "grid", gridTemplateColumns: "270px 1fr", height: 1 }}>{children}</Box>
  </Box>
);

const TableBody = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      containerRef.current.style.setProperty("--scroll-top", `${-scrollTop}px`);
    }
  };

  return (
    <Box
      ref={containerRef}
      onScroll={handleScroll}
      sx={{
        flex: 1,
        overflowY: "auto",
        scrollbarGutter: "stable",
        minHeight: 0,
        borderRadius: 1,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,

        /*
         * 表格背景設計 (Inspired by Blender UI)
         * --------------------------------------------------
         * 1. 視覺穩定性：
         * 背景由容器繪製，而非子元素。這確保了即便資料列數較少時，斑馬紋依然能鋪滿整個視圖空間，
         * 避免了網頁常見的「底部斷層」感，達到類似 Blender 等專業軟體的 UI 質感。
         * * 2. 解決 Scrollbar Gutter 渲染問題：
         * 不使用 background-attachment: local 是為了避免捲軸背景區域出現空白斷層 (沒有斑馬背景)。
         * 改用「預設背景 + CSS 變數同步」來達成完美的跨瀏覽器捲軸連貫性。
         * * 3. 開發解耦 (Decoupling)：
         * Row 元件無需維護 index 或 nth-child 狀態，對於虛擬列表 (Virtual List) 或排序功能
         * 具有極佳的適配性與效能表現。
         */
        backgroundImage: `linear-gradient(var(--mui-palette-background-content) 50%, ${colorMix(
          "background.content",
          "text.primary",
          0.97
        )} 50%)`,
        backgroundSize: `100% ${tableRowHeight * 2}px`,
        backgroundRepeat: "repeat",
        backgroundPositionY: "var(--scroll-top, 0px)",
      }}
    >
      {/* 省略，假設這裡是 table content，外層是虛擬 hook 提供的總高度，內層是 position: absolute 的虛擬化列 */}
      <Box sx={{ height: tableRowHeight * 50, position: "relative" }}>
        {new Array(50).fill(null).map((_, index) => (
          <Box
            key={index}
            sx={{ height: tableRowHeight, position: "absolute", top: index * tableRowHeight, left: 0, right: 0 }}
          />
        ))}
      </Box>
    </Box>
  );
};

const App = () => (
  <Container>
    <NavigationPanels />
    <Box sx={{ p: 1, display: "flex", flexDirection: "column", height: 1, minHeight: 0 }}>
      <NavigationBar />
      <TableHead />
      <TableBody />
    </Box>
  </Container>
);

startReactApp({
  App,
  beforeRender: () => {
    registerInitData();
    registerSelectionEvents();
    registerNavigateShortcuts();
    registerMessageEvents();
    registerClipboardEvents();
  },
});
