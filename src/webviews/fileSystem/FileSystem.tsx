import { Box } from "@mui/material";
import { FileSystemHeader } from "./header/FileSystemHeader";
import { FileSystemTable } from "./table/FileSystemTable";
import { LoadingDisplay } from "./global/LoadingDisplay";
import { BoxSelectionOverlay } from "./global/BoxSelectionOverlay";

const FileSystem = () => (
  <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
    {/* 外層讓 LoadingDisplay 可以拿到 scrollContainer 的底部，但不被 scroll 影響 */}
    <Box sx={{ position: "relative", flex: 1, minHeight: 0 }}>
      {/* 外層提供 scollContainer，內層讓 BoxSelectionOverlay 可以拿到所有可滾動的總高度 */}
      <Box id="file-system-body-wrapper" sx={{ position: "relative", overflow: "auto", height: 1, minHeight: 0 }}>
        <Box sx={{ position: "relative", display: "flex", flexDirection: "column", minHeight: 1 }}>
          <FileSystemHeader />

          <FileSystemTable />

          <BoxSelectionOverlay />
        </Box>
      </Box>

      <LoadingDisplay />
    </Box>
  </Box>
);

export { FileSystem };
