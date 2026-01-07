import * as vscode from "vscode";
import { registerImageViewerCommands } from "@/commands/imageViewerCommands";
import { registerExplorerCommands } from "@/commands/explorerCommands";

import FileMetadataDisplay from "@/feature-metadata";
import CustomStylesPatch from "@/feature-styles";
import GeneralTweaks from "@/feature-tweaks";

/**
 * ?
 */
const features = [FileMetadataDisplay, CustomStylesPatch, GeneralTweaks];

/**
 * ?
 */
export function activate(context: vscode.ExtensionContext) {
  registerImageViewerCommands(context);
  registerExplorerCommands(context);

  for (const feature of features) {
    try {
      feature.activate(context);
    } catch (error) {
      //TODO: 紀錄錯誤
    }
  }
}

/**
 * ?
 */
export function deactivate() {
  for (const feature of features) {
    try {
      feature.deactivate?.();
    } catch (error) {
      // TODO: 紀錄錯誤
    }
  }
}
