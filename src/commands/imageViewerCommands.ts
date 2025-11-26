import * as vscode from "vscode";
import { ImageViewerEditorProvider } from "../providers/imageViewerProvider";

/**
 * 註冊圖片檢視器相關命令與編輯器
 */
function registerImageViewerCommands(context: vscode.ExtensionContext) {
  /**
   * 用於儲存所有開啟的 image viewer webviews ，識別碼為 vscode.Uri.path (文件路徑)，只用於傳送重設縮放指令
   */
  const webviewsMap = new Map<string, vscode.WebviewPanel>();

  /**
   * 取得目前活動的 image viewer webview 面板
   */
  const getPanel = () => {
    const e = vscode.window.tabGroups.activeTabGroup.activeTab?.input as any;
    if (!e || !e?.uri?.path) return null;

    const uri = e.uri as vscode.Uri;
    const webviewId = uri.path;
    const webviewPanel = webviewsMap.get(webviewId);

    if (!webviewPanel) return null;
    return webviewPanel;
  };

  const provider = new ImageViewerEditorProvider(context, webviewsMap);
  const providerRegistration = vscode.window.registerCustomEditorProvider("1ureka.imageViewer", provider, {
    webviewOptions: { retainContextWhenHidden: true },
    supportsMultipleEditorsPerDocument: false, // 確保識別碼唯一
  });

  const resetTransformCommand = vscode.commands.registerCommand("1ureka.imageViewer.resetTransform", () => {
    const panel = getPanel();
    if (panel) panel.webview.postMessage({ type: "resetTransform" });
  });

  const eyeDropperCommand = vscode.commands.registerCommand("1ureka.imageViewer.eyeDropper", async () => {
    const panel = getPanel();
    if (panel) panel.webview.postMessage({ type: "eyeDropper" });
  });

  context.subscriptions.push(providerRegistration, resetTransformCommand, eyeDropperCommand);
}

export { registerImageViewerCommands };
