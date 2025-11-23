import * as vscode from "vscode";
import * as path from "path";
import { generateReactHtml } from "../utils/webviewHelper";
import { ImageViewerEditorProvider } from "../providers/imageViewerProvider";
import { openImage } from "../utils/imageOpener";

export function registerImageViewerCommands(context: vscode.ExtensionContext) {
  const provider = new ImageViewerEditorProvider((document, webviewPanel) => {
    resolveImageViewer(document, webviewPanel);
  });

  // 儲存所有開啟的 image viewer webviews ，識別碼為 vscode.Uri.path (文件路徑)，只用於傳送重設縮放指令
  const webviewsMap = new Map<string, vscode.WebviewPanel>();

  async function resolveImageViewer(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) {
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [context.extensionUri, vscode.Uri.file(path.dirname(document.uri.fsPath))],
    };

    const initialData = {
      uri: webviewPanel.webview.asWebviewUri(document.uri).toString(),
      metadata: await openImage(document.uri.fsPath),
    };

    webviewPanel.webview.html = generateReactHtml({
      webviewType: "imageViewer",
      webview: webviewPanel.webview,
      extensionUri: context.extensionUri,
      initialData,
    });

    webviewPanel.webview.onDidReceiveMessage(
      (message) => {
        if (message.type === "error") vscode.window.showErrorMessage(message.error);
        if (message.type === "info") vscode.window.showInformationMessage(message.info);
        if (message.type === "eyeDropper") {
          const color = message.color as string;
          vscode.env.clipboard
            .writeText(color)
            .then(() => vscode.window.showInformationMessage(`選取的顏色 ${color} 已複製到剪貼簿`));
        }
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

  const getWebviewId = () => {
    const e = vscode.window.tabGroups.activeTabGroup.activeTab?.input as any;
    if (!e || !e?.uri?.path) return null;
    const uri = e.uri as vscode.Uri;
    return uri.path;
  };

  const resetTransformCommand = vscode.commands.registerCommand("extension.imageViewer.resetTransform", () => {
    const webviewId = getWebviewId();
    if (!webviewId) return;

    const webviewPanel = webviewsMap.get(webviewId);
    if (webviewPanel) {
      webviewPanel.webview.postMessage({ type: "resetTransform" });
    }
  });

  const eyeDropperCommand = vscode.commands.registerCommand("extension.imageViewer.eyeDropper", async () => {
    const webviewId = getWebviewId();
    if (!webviewId) return;

    const webviewPanel = webviewsMap.get(webviewId);
    if (webviewPanel) {
      webviewPanel.webview.postMessage({ type: "eyeDropper" });
    }
  });

  context.subscriptions.push(providerRegistration, resetTransformCommand, eyeDropperCommand);
}
