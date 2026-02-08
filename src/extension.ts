import * as vscode from "vscode";
import FileMetadataDisplay from "@/feature-metadata";
import CustomStylesPatch from "@/feature-styles";
import GeneralTweaks from "@/feature-tweaks";
import SystemExplorer from "@/feature-explorer";

/**
 * 擴展功能模組清單，包含所有需要啟動的功能
 */
const features = [FileMetadataDisplay, CustomStylesPatch, GeneralTweaks, SystemExplorer];

/**
 * 擴展啟動函數，依序啟動所有功能模組
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
 * 擴展停用函數，依序停用所有功能模組
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
