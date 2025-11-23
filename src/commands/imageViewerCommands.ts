import * as vscode from "vscode";
import * as path from "path";
import { generateReactHtml } from "../utils/webviewHelper";
import { ImageViewerEditorProvider } from "../providers/imageViewerProvider";
import { openImage } from "../utils/imageOpener";
import { copyImage } from "../utils/system_windows";

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

    const messageListener = webviewPanel.webview.onDidReceiveMessage(async (message) => {
      if (message.type === "error") {
        vscode.window.showErrorMessage(message.error);
      }

      if (message.type === "info") {
        vscode.window.showInformationMessage(message.info);
      }

      if (message.type === "copy") {
        const filePath = document.uri.fsPath;

        if (process.platform !== "win32") {
          const uri = vscode.Uri.file(filePath);
          await vscode.env.clipboard.writeText(uri.fsPath);
          vscode.window.showInformationMessage(`已複製圖片路徑: ${uri.fsPath}`);
          return;
        }

        try {
          await copyImage(filePath);
          const message = "圖片已複製到剪貼簿\n\n可以直接貼到其他應用中 (如 Word 或是瀏覽器的 Google Keep, ChatGPT 等)";
          vscode.window.showInformationMessage(message);
        } catch (error) {
          const message = `複製圖片到剪貼簿失敗: ${error instanceof Error ? error.message : String(error)}`;
          vscode.window.showErrorMessage(message);
        }
      }

      if (message.type === "eyeDropper") {
        const color = message.color as string;
        vscode.env.clipboard
          .writeText(color)
          .then(() => vscode.window.showInformationMessage(`選取的顏色 ${color} 已複製到剪貼簿`));
      }
    });

    context.subscriptions.push(messageListener);

    webviewsMap.set(document.uri.path, webviewPanel);
    const disposeListener = webviewPanel.onDidDispose(() => {
      webviewsMap.delete(document.uri.path);
    });

    context.subscriptions.push(disposeListener);
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
