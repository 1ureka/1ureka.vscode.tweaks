import * as vscode from "vscode";
import { ImageViewerEditorProvider } from "@/providers/imageViewerProvider";

/**
 * 註冊圖片檢視器相關命令與編輯器
 */
function registerImageViewerCommands(context: vscode.ExtensionContext) {
  const provider = new ImageViewerEditorProvider(context);
  const providerRegistration = vscode.window.registerCustomEditorProvider("1ureka.imageViewer", provider, {
    webviewOptions: { retainContextWhenHidden: true },
    supportsMultipleEditorsPerDocument: false,
  });

  context.subscriptions.push(providerRegistration);
}

export { registerImageViewerCommands };
