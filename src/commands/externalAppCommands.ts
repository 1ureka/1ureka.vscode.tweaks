import * as vscode from "vscode";
import * as fs from "fs";

import { handleOpenApp } from "@/handlers/externalAppHandlers";
import { openWithDefaultApp } from "@/utils/system_windows";
import { createCommandManager, getConfig } from "@/utils/command";

export function registerExternalAppCommands(context: vscode.ExtensionContext) {
  const commandManager = createCommandManager(context);

  commandManager.register("1ureka.external.openBlender", () => {
    // 優先使用使用者配置的路徑
    const userPath = getConfig("1ureka.blenderPath");
    const isPathProvided = userPath && userPath.trim() !== "";

    let openAppParams: Parameters<typeof handleOpenApp>[0] = {
      app: "blender",
      showError: vscode.window.showErrorMessage,
    };

    if (isPathProvided && fs.existsSync(userPath)) {
      openAppParams.appPath = userPath;
    } else if (isPathProvided) {
      vscode.window.showWarningMessage(`配置的 Blender 路徑不存在: ${userPath}，將嘗試自動搜尋安裝路徑。`);
    }

    handleOpenApp(openAppParams);
  });

  commandManager.register("1ureka.external.openPainter", () => {
    // 優先使用使用者配置的路徑
    const userPath = getConfig("1ureka.painterPath");
    const isPathProvided = userPath && userPath.trim() !== "";

    let openAppParams: Parameters<typeof handleOpenApp>[0] = {
      app: "painter",
      showError: vscode.window.showErrorMessage,
    };

    if (isPathProvided && fs.existsSync(userPath)) {
      openAppParams.appPath = userPath;
    } else if (isPathProvided) {
      vscode.window.showWarningMessage(`配置的 Substance 3D Painter 路徑不存在: ${userPath}，將嘗試自動搜尋安裝路徑。`);
    }

    handleOpenApp(openAppParams);
  });

  commandManager.register("1ureka.external.openWithBlender", (uri: vscode.Uri) => {
    if (!uri) return;
    openWithDefaultApp(uri.fsPath, vscode.window.showErrorMessage);
  });

  commandManager.register("1ureka.external.openWithPainter", (uri: vscode.Uri) => {
    if (!uri) return;
    openWithDefaultApp(uri.fsPath, vscode.window.showErrorMessage);
  });

  commandManager.register("1ureka.external.openWithBrowser", (uri: vscode.Uri) => {
    if (!uri) return;
    openWithDefaultApp(uri.fsPath, vscode.window.showErrorMessage);
  });
}
