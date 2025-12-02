import * as vscode from "vscode";
import * as path from "path";
import type { CustomDocument, CustomDocumentOpenContext, WebviewPanel, CancellationToken } from "vscode";

import { handleCopyImage, handleEyeDropper, handleExportImage } from "@/handlers/imageViewerHandler";
import { createWebviewPanelManager } from "@/utils/webview";
import { onDidReceiveInvoke } from "@/utils/message_host";
import { openImage } from "@/utils/image";

// ---------------------------------------------------------------------------------
// 定義初始注入資料型別與延伸主機端所有可呼叫的處理器 API 型別
// ---------------------------------------------------------------------------------

type ImageViewerInitialData = { uri: string; metadata: Awaited<ReturnType<typeof openImage>> };
type ShowInfoAPI = { id: "showInfo"; handler: (info: string) => void };
type ShowErrorAPI = { id: "showError"; handler: (error: string) => void };
type CopyImageAPI = { id: "copyImage"; handler: () => void };
type ExportImageAPI = { id: "exportImage"; handler: () => void };
type EyeDropperAPI = { id: "eyeDropper"; handler: typeof handleEyeDropper };

export type { ImageViewerInitialData, ShowInfoAPI, ShowErrorAPI, CopyImageAPI, ExportImageAPI, EyeDropperAPI };

/**
 * 圖片檢視器自訂編輯器提供者
 */
class ImageViewerEditorProvider implements vscode.CustomReadonlyEditorProvider {
  /** 該插件的上下文，用於存取資源 */
  private readonly context: vscode.ExtensionContext;
  private readonly panelManager: ReturnType<typeof createWebviewPanelManager>;

  /**
   * 根據上下文與 webviewsMap 為插件建立一個圖片檢視器自訂編輯器提供者
   */
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.panelManager = createWebviewPanelManager(context);
  }

  /**
   * 取得目前活動的圖片檢視器面板
   */
  getCurrentPanel() {
    return this.panelManager.getCurrent();
  }

  /**
   * 開啟自訂文件 (無需額外處理)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async openCustomDocument(uri: vscode.Uri, _1: CustomDocumentOpenContext, _2: CancellationToken) {
    return { uri, dispose: () => {} } as CustomDocument;
  }

  /**
   * 開啟自訂編輯器時要顯示的內容
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async resolveCustomEditor(document: CustomDocument, panelFromParams: WebviewPanel, _: CancellationToken) {
    const initialData: ImageViewerInitialData = {
      uri: panelFromParams.webview.asWebviewUri(document.uri).toString(),
      metadata: await openImage(document.uri.fsPath),
    };

    const panel = this.panelManager.create<ImageViewerInitialData>({
      panel: panelFromParams,
      webviewType: "imageViewer",
      extensionUri: this.context.extensionUri,
      resourceUri: vscode.Uri.file(path.dirname(document.uri.fsPath)),
      initialData,
    });

    onDidReceiveInvoke<ShowInfoAPI>(panel, "showInfo", vscode.window.showInformationMessage);
    onDidReceiveInvoke<ShowErrorAPI>(panel, "showError", vscode.window.showErrorMessage);
    onDidReceiveInvoke<CopyImageAPI>(panel, "copyImage", () => handleCopyImage(document.uri.fsPath));
    onDidReceiveInvoke<ExportImageAPI>(panel, "exportImage", () => handleExportImage(document.uri.fsPath));
    onDidReceiveInvoke<EyeDropperAPI>(panel, "eyeDropper", handleEyeDropper);
  }
}

export { ImageViewerEditorProvider };
