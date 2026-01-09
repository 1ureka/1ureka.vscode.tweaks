import * as vscode from "vscode";

/**
 * 擴展功能模組介面，定義了功能模組的生命週期方法
 */
type ExtensionFeature = {
  activate: (context: vscode.ExtensionContext) => void;
  deactivate?: () => void;
};

export { ExtensionFeature };
