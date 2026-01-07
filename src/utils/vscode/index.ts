import * as vscode from "vscode";

/**
 * ?
 */
type ExtensionFeature = {
  activate: (context: vscode.ExtensionContext) => void;
  deactivate?: () => void;
};

export { ExtensionFeature };
