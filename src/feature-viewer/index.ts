import * as vscode from "vscode";
import type { ExtensionFeature } from "@/utils/vscode";
import { ImageViewerEditorProvider } from "@/feature-viewer/provider";

/**
 * 啟動圖片檢視器功能，註冊自訂編輯器
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
 * 圖片檢視器功能模組
 */
const feature: ExtensionFeature = {
  activate,
};

export default feature;
