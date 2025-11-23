import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { openWithDefaultApp, openApplication } from "../utils/system_windows";

function getBlenderPath(): string | null {
  // 優先使用使用者配置的路徑
  const config = vscode.workspace.getConfiguration("1ureka");
  const userPath = config.get<string>("blenderPath");

  if (userPath && userPath.trim() !== "") {
    if (fs.existsSync(userPath)) {
      return userPath;
    } else {
      vscode.window.showWarningMessage(`配置的 Blender 路徑不存在: ${userPath}`);
    }
  }

  // 若未配置或路徑無效,自動搜尋
  const possiblePaths = ["C:\\Program Files\\Blender Foundation", "C:\\Program Files (x86)\\Blender Foundation"];

  for (const basePath of possiblePaths) {
    if (!fs.existsSync(basePath)) continue;

    try {
      const versions = fs.readdirSync(basePath).filter((name) => name.startsWith("Blender"));
      const sortedVersions = versions.sort((a, b) => b.localeCompare(a));

      for (const version of sortedVersions) {
        const exePath = path.join(basePath, version, "blender.exe");
        if (fs.existsSync(exePath)) return exePath;
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

function getPainterPath(): string | null {
  // 優先使用使用者配置的路徑
  const config = vscode.workspace.getConfiguration("1ureka");
  const userPath = config.get<string>("painterPath");

  if (userPath && userPath.trim() !== "") {
    if (fs.existsSync(userPath)) {
      return userPath;
    } else {
      vscode.window.showWarningMessage(`配置的 Painter 路徑不存在: ${userPath}`);
    }
  }

  // 若未配置或路徑無效,自動搜尋
  const possiblePaths = [
    "C:\\Program Files\\Adobe\\Adobe Substance 3D Painter",
    "C:\\Program Files (x86)\\Adobe\\Adobe Substance 3D Painter",
  ];

  for (const basePath of possiblePaths) {
    if (!fs.existsSync(basePath)) continue;

    try {
      const exePath = path.join(basePath, "Adobe Substance 3D Painter.exe");
      if (fs.existsSync(exePath)) return exePath;

      // 如果有版本子資料夾，列出並找最新版
      const items = fs.readdirSync(basePath);
      const versions = items.filter((name) => /^\d/.test(name)).sort((a, b) => b.localeCompare(a));

      for (const version of versions) {
        const versionPath = path.join(basePath, version, "Adobe Substance 3D Painter.exe");
        if (fs.existsSync(versionPath)) return versionPath;
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

function handleOpenApp(app: "blender" | "painter") {
  const appPath = app === "blender" ? getBlenderPath() : getPainterPath();
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

function handleOpenFile(uri: vscode.Uri | undefined) {
  if (uri?.fsPath) openWithDefaultApp(uri.fsPath);
}

export function registerExternalAppCommands(context: vscode.ExtensionContext) {
  const openBlenderCommand = vscode.commands.registerCommand("extension.openBlender", () => {
    handleOpenApp("blender");
  });

  const openPainterCommand = vscode.commands.registerCommand("extension.openPainter", () => {
    handleOpenApp("painter");
  });

  const openWithBlenderCommand = vscode.commands.registerCommand("extension.openWithBlender", (uri: vscode.Uri) => {
    handleOpenFile(uri);
  });

  const openWithPainterCommand = vscode.commands.registerCommand("extension.openWithPainter", (uri: vscode.Uri) => {
    handleOpenFile(uri);
  });

  context.subscriptions.push(openBlenderCommand, openWithBlenderCommand, openPainterCommand, openWithPainterCommand);
}
