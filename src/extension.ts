import * as vscode from "vscode";
import { registerBlenderCommands } from "./commands/blenderCommands";
import { registerPainterCommands } from "./commands/painterCommands";
import { registerImageWallCommands } from "./commands/imageWallCommands";
import { registerFileTimestampCommands } from "./commands/fileTimestampCommands";
import { registerInjectStylesCommands } from "./commands/injectStylesCommands";

export function activate(context: vscode.ExtensionContext) {
  if (process.platform === "win32") {
    registerBlenderCommands(context);
    registerPainterCommands(context);
  }

  registerImageWallCommands(context);
  registerFileTimestampCommands(context);
  registerInjectStylesCommands(context);
}

export function deactivate() {}
