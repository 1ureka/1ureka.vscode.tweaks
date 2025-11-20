import * as vscode from "vscode";
import { openWithDefaultApp, openApplication } from "../utils/fileOpener";
import * as fs from "fs";
import * as path from "path";

function findPainterPath(): string | null {
  // 常見的 Substance 3D Painter 安裝位置
  const possiblePaths = [
    "C:\\Program Files\\Adobe\\Adobe Substance 3D Painter",
    "C:\\Program Files (x86)\\Adobe\\Adobe Substance 3D Painter",
  ];

  for (const basePath of possiblePaths) {
    if (!fs.existsSync(basePath)) continue;

    try {
      const exePath = path.join(basePath, "Adobe Substance 3D Painter.exe");
      if (fs.existsSync(exePath)) {
        return exePath;
      }

      // 如果有版本子資料夾，列出並找最新版
      const items = fs.readdirSync(basePath);
      const versions = items.filter((name) => /^\d/.test(name)).sort((a, b) => b.localeCompare(a));

      for (const version of versions) {
        const versionPath = path.join(basePath, version, "Adobe Substance 3D Painter.exe");
        if (fs.existsSync(versionPath)) {
          return versionPath;
        }
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

export function registerPainterCommands(context: vscode.ExtensionContext) {
  // 開啟 Painter (無檔案)
  const openPainterCommand = vscode.commands.registerCommand("extension.openPainter", () => {
    const painterPath = findPainterPath();
    if (painterPath) {
      openApplication("painter", painterPath);
    } else {
      vscode.window.showErrorMessage("找不到 Adobe Substance 3D Painter 安裝路徑，請確認已安裝該軟體");
    }
  });

  // 以 Painter 開啟檔案
  const openWithPainterCommand = vscode.commands.registerCommand("extension.openWithPainter", (uri: vscode.Uri) => {
    if (uri?.fsPath) {
      openWithDefaultApp(uri.fsPath);
    }
  });

  context.subscriptions.push(openPainterCommand, openWithPainterCommand);
}
