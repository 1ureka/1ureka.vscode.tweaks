import * as vscode from "vscode";
import type { ExtensionFeature } from "@/utils/vscode";
import { ImageViewerEditorProvider } from "@/feature-viewer/provider";

/**
 * ?
 */
function activate(context: vscode.ExtensionContext) {
  const provider = new ImageViewerEditorProvider(context);
  const providerRegistration = vscode.window.registerCustomEditorProvider("1ureka.imageViewer", provider, {
    webviewOptions: { retainContextWhenHidden: true },
    supportsMultipleEditorsPerDocument: false,
  });

  context.subscriptions.push(providerRegistration);
}

/**
 * ?
 */
const feature: ExtensionFeature = {
  activate,
};

export default feature;
