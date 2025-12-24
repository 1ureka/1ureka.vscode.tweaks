import * as vscode from "vscode";
import { registerImageViewerCommands } from "@/commands/imageViewerCommands";
import { registerExplorerCommands } from "@/commands/explorerCommands";
import { registerExternalAppCommands, registerFileMetadataCommands } from "@/commands/commonCommands";
import { registerInjectStylesCommands, registerNavigationCommands } from "@/commands/commonCommands";

export function activate(context: vscode.ExtensionContext) {
  registerExternalAppCommands(context);
  registerImageViewerCommands(context);
  registerFileMetadataCommands(context);
  registerExplorerCommands(context);
  registerInjectStylesCommands(context);
  registerNavigationCommands(context);
}

export function deactivate() {}
