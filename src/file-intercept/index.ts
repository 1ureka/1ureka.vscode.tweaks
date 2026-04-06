import * as vscode from "vscode";
import type { ExtensionFeature } from "@/vscode";
import { FileInterceptProvider } from "@/file-intercept/provider";

/**
 * 啟動檔案攔截功能，以 Webview 取代 VS Code 對特定二進位 / 媒體檔案的預設處理
 */
function activate(context: vscode.ExtensionContext) {
  const provider = new FileInterceptProvider();

  const registration = vscode.window.registerCustomEditorProvider("1ureka.vscode.fileIntercept", provider, {
    webviewOptions: { retainContextWhenHidden: false },
    supportsMultipleEditorsPerDocument: false,
  });

  context.subscriptions.push(registration);
}

/**
 * 檔案攔截功能模組
 */
const feature: ExtensionFeature = {
  activate,
};

export default feature;
