import * as vscode from "vscode";
import * as path from "path";
import { generateReactHtml } from "../utils/webviewHelper";
import { ImageViewerEditorProvider } from "../providers/imageViewerProvider";

export function registerImageViewerCommands(context: vscode.ExtensionContext) {
  const provider = new ImageViewerEditorProvider((document, webviewPanel) => {
    resolveImageViewer(document, webviewPanel);
  });

  // 儲存所有開啟的 image viewer webviews ，識別碼為 vscode.Uri.path (文件路徑)，只用於傳送重設縮放指令
  const webviewsMap = new Map<string, vscode.WebviewPanel>();

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

    webviewsMap.set(document.uri.path, webviewPanel);

    webviewPanel.onDidDispose(
      () => {
        webviewsMap.delete(document.uri.path);
      },
      undefined,
      context.subscriptions
    );
  }

  const providerRegistration = vscode.window.registerCustomEditorProvider("1ureka.imageViewer", provider, {
    webviewOptions: { retainContextWhenHidden: true },
    supportsMultipleEditorsPerDocument: false,
  });

  const commandRegistration = vscode.commands.registerCommand("extension.imageViewer.resetTransform", () => {
    const e = vscode.window.tabGroups.activeTabGroup.activeTab?.input as any;
    if (!e || !e?.uri?.path) return;
    const uri = e.uri as vscode.Uri;

    const webviewPanel = webviewsMap.get(uri.path);
    if (webviewPanel) {
      webviewPanel.webview.postMessage({ type: "resetTransform" });
    }
  });

  context.subscriptions.push(providerRegistration, commandRegistration);
}
