import * as vscode from "vscode";
import * as path from "path";
import { generateReactHtml } from "../utils/webviewHelper";
import { ImageViewerEditorProvider } from "../providers/imageViewerProvider";

export function registerImageViewerCommands(context: vscode.ExtensionContext) {
  const provider = new ImageViewerEditorProvider((document, webviewPanel) => {
    resolveImageViewer(document, webviewPanel);
  });

  function resolveImageViewer(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) {
    const fileName = path.basename(document.uri.fsPath);
    const fileExt = path.extname(fileName).toLowerCase().slice(1);

    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [context.extensionUri, vscode.Uri.file(path.dirname(document.uri.fsPath))],
    };

    const imageUri = webviewPanel.webview.asWebviewUri(document.uri).toString();
    const initialData = { imageUri, fileName, fileExt, filePath: document.uri.fsPath };

    webviewPanel.webview.html = generateReactHtml({
      webviewType: "imageViewer",
      webview: webviewPanel.webview,
      extensionUri: context.extensionUri,
      initialData,
    });

    webviewPanel.webview.onDidReceiveMessage(
      (message) => {
        if (message.type === "error") vscode.window.showErrorMessage(`圖片載入失敗: ${message.error}`);
      },
      undefined,
      context.subscriptions
    );
  }

  const providerRegistration = vscode.window.registerCustomEditorProvider("1ureka.imageViewer", provider, {
    webviewOptions: { retainContextWhenHidden: true },
    supportsMultipleEditorsPerDocument: true,
  });

  context.subscriptions.push(providerRegistration);
}
