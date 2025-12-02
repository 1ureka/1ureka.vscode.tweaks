import * as vscode from "vscode";
import { handleOpenApp, handleOpenFile } from "../handlers/externalAppHandlers";
import { createCommandManager } from "@/utils/command";

export function registerExternalAppCommands(context: vscode.ExtensionContext) {
  const commandManager = createCommandManager(context);

  commandManager.register("1ureka.openBlender", () => {
    handleOpenApp("blender");
  });

  commandManager.register("1ureka.openPainter", () => {
    handleOpenApp("painter");
  });

  commandManager.register("1ureka.openWithBlender", (uri: vscode.Uri) => {
    handleOpenFile(uri);
  });

  commandManager.register("1ureka.openWithPainter", (uri: vscode.Uri) => {
    handleOpenFile(uri);
  });
}
