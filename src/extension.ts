import * as vscode from "vscode";
import { registerBlenderCommands } from "./commands/blenderCommands";
import { registerPainterCommands } from "./commands/painterCommands";
import { registerImageWallCommands } from "./commands/imageWallCommands";
import { registerFileTimestampCommands } from "./commands/fileTimestampCommands";
import { registerInjectFontsCommands } from "./commands/injectFontsCommands";

export function activate(context: vscode.ExtensionContext) {
  if (process.platform === "win32") {
    registerBlenderCommands(context);
    registerPainterCommands(context);
  }

  registerImageWallCommands(context);
  registerFileTimestampCommands(context);
  registerInjectFontsCommands(context);
}

export function deactivate() {}
