import * as vscode from "vscode";
import { registerExternalAppCommands } from "./commands/externalAppCommands";
import { registerImageWallCommands } from "./commands/imageWallCommands";
import { registerImageViewerCommands } from "./commands/imageViewerCommands";
import { registerFileMetadataCommands } from "./commands/fileMetadataCommands";
import { registerFileSystemCommands } from "./commands/fileSystemCommands";
import { registerInjectStylesCommands } from "./commands/injectStylesCommands";

export function activate(context: vscode.ExtensionContext) {
  if (process.platform === "win32") {
    registerExternalAppCommands(context);
  }

  registerImageWallCommands(context);
  registerImageViewerCommands(context);
  registerFileMetadataCommands(context);
  registerFileSystemCommands(context);
  registerInjectStylesCommands(context);
}

export function deactivate() {}
