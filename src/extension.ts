import * as vscode from "vscode";
import FileMetadataDisplay from "@/feature-metadata";
import CustomStylesPatch from "@/feature-styles";
import GeneralTweaks from "@/feature-tweaks";
import SystemExplorer from "@/feature-explorer";
import ImageViewer from "@/feature-viewer";

/**
 * ?
 */
const features = [FileMetadataDisplay, CustomStylesPatch, GeneralTweaks, SystemExplorer, ImageViewer];

/**
 * ?
 */
export function activate(context: vscode.ExtensionContext) {
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
