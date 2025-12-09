import * as fs from "fs";
import * as path from "path";
import { openApplication } from "@/utils/system_windows";

interface AppSearchConfig {
  possiblePaths: string[];
  exeFileName: string;
  versionFilter?: (name: string) => boolean;
  versionFolder?: boolean;
}

/**
 * 通用的應用程式路徑搜尋函數
 */
const findAppPath = (config: AppSearchConfig): string | null => {
  for (const basePath of config.possiblePaths) {
    if (!fs.existsSync(basePath)) continue;

    try {
      // 檢查直接路徑
      const directExePath = path.join(basePath, config.exeFileName);
      if (fs.existsSync(directExePath)) return directExePath;

      // 檢查版本資料夾
      if (config.versionFolder) {
        const items = fs.readdirSync(basePath);
        const versions = items.filter(config.versionFilter || (() => true)).sort((a, b) => b.localeCompare(a));

        for (const version of versions) {
          const versionPath = path.join(basePath, version, config.exeFileName);
          if (fs.existsSync(versionPath)) return versionPath;
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      continue;
    }
  }

  return null;
};

/**
 * 嘗試尋找 Blender 可執行檔的路徑
 */
const handleFindBlenderPath = (): string | null => {
  return findAppPath({
    possiblePaths: ["C:\\Program Files\\Blender Foundation", "C:\\Program Files (x86)\\Blender Foundation"],
    exeFileName: "blender.exe",
    versionFilter: (name) => name.startsWith("Blender"),
    versionFolder: true,
  });
};

/**
 * 嘗試尋找 Painter 可執行檔的路徑
 */
const handleFindPainterPath = (): string | null => {
  return findAppPath({
    possiblePaths: [
      "C:\\Program Files\\Adobe\\Adobe Substance 3D Painter",
      "C:\\Program Files (x86)\\Adobe\\Adobe Substance 3D Painter",
    ],
    exeFileName: "Adobe Substance 3D Painter.exe",
    versionFilter: (name) => /^\d/.test(name),
    versionFolder: true,
  });
};

/**
 * 處理開啟外部應用程式的邏輯
 */
function handleOpenApp(params: { app: "blender" | "painter"; appPath?: string; showError: (message: string) => void }) {
  const { app, appPath: providedAppPath, showError } = params;

  let appPath: string | null = null;

  if (providedAppPath) {
    appPath = providedAppPath;
  } else {
    appPath = app === "blender" ? handleFindBlenderPath() : handleFindPainterPath();
  }

  if (appPath) {
    openApplication(app, appPath, showError);
  } else {
    const appName = app === "blender" ? "Blender" : "Adobe Substance 3D Painter";
    const settingName = app === "blender" ? "1ureka.blenderPath" : "1ureka.painterPath";

    showError(`找不到 ${appName} 安裝路徑。請在設定中手動指定路徑 (${settingName}) 或確認已安裝該軟體。`);
  }
}

export { handleOpenApp };
