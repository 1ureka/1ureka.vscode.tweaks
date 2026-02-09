import * as vscode from "vscode";
import FileMetadataDisplay from "@/metadata-display";
import CustomStylesPatch from "@/custom-styles";
import OpenFile from "@/open-file";

/**
 * 擴展功能模組清單，包含所有需要啟動的功能
 */
const features = [FileMetadataDisplay, CustomStylesPatch, OpenFile];

/**
 * 擴展啟動函數，依序啟動所有功能模組
 */
export function activate(context: vscode.ExtensionContext) {
  for (const feature of features) {
    feature.activate(context);
  }
}

/**
 * 擴展停用函數，依序停用所有功能模組
 */
export function deactivate() {
  for (const feature of features) {
    feature.deactivate?.();
  }
}
