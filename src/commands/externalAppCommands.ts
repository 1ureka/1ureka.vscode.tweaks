import * as vscode from "vscode";
import { handleOpenApp, handleOpenFile } from "../handlers/externalAppHandlers";

export function registerExternalAppCommands(context: vscode.ExtensionContext) {
  const openBlenderCommand = vscode.commands.registerCommand("1ureka.openBlender", () => {
    handleOpenApp("blender");
  });

  const openPainterCommand = vscode.commands.registerCommand("1ureka.openPainter", () => {
    handleOpenApp("painter");
  });

  const openWithBlenderCommand = vscode.commands.registerCommand("1ureka.openWithBlender", (uri: vscode.Uri) => {
    handleOpenFile(uri);
  });

  const openWithPainterCommand = vscode.commands.registerCommand("1ureka.openWithPainter", (uri: vscode.Uri) => {
    handleOpenFile(uri);
  });

  context.subscriptions.push(openBlenderCommand, openWithBlenderCommand, openPainterCommand, openWithPainterCommand);
}
