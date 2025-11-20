import * as vscode from "vscode";
import { openWithDefaultApp, openApplication } from "../utils/fileOpener";
import * as fs from "fs";
import * as path from "path";

function findBlenderPath(): string | null {
  // 常見的 Blender 安裝位置
  const possiblePaths = ["C:\\Program Files\\Blender Foundation", "C:\\Program Files (x86)\\Blender Foundation"];

  for (const basePath of possiblePaths) {
    if (!fs.existsSync(basePath)) continue;

    try {
      // 列出所有 Blender 版本資料夾
      const versions = fs
        .readdirSync(basePath)
        .filter((name) => name.startsWith("Blender"))
        .sort((a, b) => b.localeCompare(a)); // 降序排列，最新版在前

      for (const version of versions) {
        const exePath = path.join(basePath, version, "blender.exe");
        if (fs.existsSync(exePath)) {
          return exePath;
        }
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

export function registerBlenderCommands(context: vscode.ExtensionContext) {
  // 開啟 Blender (無檔案)
  const openBlenderCommand = vscode.commands.registerCommand("extension.openBlender", () => {
    const blenderPath = findBlenderPath();
    if (blenderPath) {
      openApplication("blender", blenderPath);
    } else {
      vscode.window.showErrorMessage("找不到 Blender 安裝路徑，請確認已安裝 Blender");
    }
  });

  // 以 Blender 開啟檔案
  const openWithBlenderCommand = vscode.commands.registerCommand("extension.openWithBlender", (uri: vscode.Uri) => {
    if (uri?.fsPath) {
      openWithDefaultApp(uri.fsPath);
    }
  });

  context.subscriptions.push(openBlenderCommand, openWithBlenderCommand);
}
