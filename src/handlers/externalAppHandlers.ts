import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { openWithDefaultApp, openApplication } from "../utils/system_windows";

interface AppSearchConfig {
  configKey: string;
  appDisplayName: string;
  possiblePaths: string[];
  exeFileName: string;
  versionFilter?: (name: string) => boolean;
  versionFolder?: boolean;
}

/**
 * 通用的應用程式路徑搜尋函數
 */
const findAppPath = (config: AppSearchConfig): string | null => {
  // 優先使用使用者配置的路徑
  const vscodeConfig = vscode.workspace.getConfiguration("1ureka");
  const userPath = vscodeConfig.get<string>(config.configKey);

  if (userPath && userPath.trim() !== "") {
    if (fs.existsSync(userPath)) return userPath;
    else vscode.window.showWarningMessage(`配置的 ${config.appDisplayName} 路徑不存在: ${userPath}`);
  }

  // 若未配置或路徑無效,自動搜尋應用程式安裝目錄
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
    configKey: "blenderPath",
    appDisplayName: "Blender",
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
    configKey: "painterPath",
    appDisplayName: "Adobe Substance 3D Painter",
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
function handleOpenApp(app: "blender" | "painter") {
  const appPath = app === "blender" ? handleFindBlenderPath() : handleFindPainterPath();

  if (appPath) {
    openApplication(app, appPath);
  } else {
    const appName = app === "blender" ? "Blender" : "Adobe Substance 3D Painter";
    const settingName = app === "blender" ? "1ureka.blenderPath" : "1ureka.painterPath";
    vscode.window.showErrorMessage(
      `找不到 ${appName} 安裝路徑。請在設定中手動指定路徑 (${settingName}) 或確認已安裝該軟體。`
    );
  }
}

/**
 * 處理使用預設應用程式開啟檔案的邏輯
 */
function handleOpenFile(uri: vscode.Uri | undefined) {
  if (uri?.fsPath) openWithDefaultApp(uri.fsPath);
}

export { handleOpenApp, handleOpenFile };
