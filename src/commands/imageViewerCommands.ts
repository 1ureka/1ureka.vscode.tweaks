import * as vscode from "vscode";
import * as fs from "fs";
import { ImageViewerEditorProvider, startExportImage } from "../providers/imageViewerProvider";

/**
 * 註冊圖片檢視器相關命令與編輯器
 */
function registerImageViewerCommands(context: vscode.ExtensionContext) {
  /**
   * 用於儲存所有開啟的 image viewer webviews ，識別碼為 vscode.Uri.path (文件路徑)，只用於傳送重設縮放指令
   */
  const panelsMap = new Map<string, vscode.WebviewPanel>();

  /**
   * 取得目前活動的 image viewer webview 面板
   */
  const getCurrentPanel = () => {
    const e = vscode.window.tabGroups.activeTabGroup.activeTab?.input as any;
    if (!e || !e?.uri?.path) return null;

    const uri = e.uri as vscode.Uri;
    const panelId = uri.fsPath;
    const webviewPanel = panelsMap.get(panelId);

    if (!webviewPanel) return null;
    return { panelId, panel: webviewPanel };
  };

  const provider = new ImageViewerEditorProvider(context, panelsMap);
  const providerRegistration = vscode.window.registerCustomEditorProvider("1ureka.imageViewer", provider, {
    webviewOptions: { retainContextWhenHidden: true },
    supportsMultipleEditorsPerDocument: false, // 確保識別碼唯一
  });

  const resetTransformCommand = vscode.commands.registerCommand("1ureka.imageViewer.resetTransform", () => {
    const result = getCurrentPanel();
    if (result?.panel) result.panel.webview.postMessage({ type: "resetTransform" });
  });

  const eyeDropperCommand = vscode.commands.registerCommand("1ureka.imageViewer.eyeDropper", async () => {
    const result = getCurrentPanel();
    if (result?.panel) result.panel.webview.postMessage({ type: "eyeDropper" });
  });

  const exportAsCommand = vscode.commands.registerCommand("1ureka.imageViewer.exportAs", async () => {
    const result = getCurrentPanel();

    const imagePath = result?.panelId;
    if (!imagePath) {
      vscode.window.showErrorMessage("無法取得當前圖片路徑");
      return;
    }

    if (!fs.existsSync(imagePath)) {
      vscode.window.showErrorMessage("找不到原始圖片檔案");
      return;
    }

    return startExportImage(imagePath);
  });

  context.subscriptions.push(providerRegistration, resetTransformCommand, eyeDropperCommand, exportAsCommand);
}

export { registerImageViewerCommands };
