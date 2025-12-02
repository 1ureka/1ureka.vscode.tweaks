import * as vscode from "vscode";
import * as path from "path";
import type { CustomDocument, CustomDocumentOpenContext, WebviewPanel, CancellationToken } from "vscode";

import { handleCopyImage, handleEyeDropper } from "@/handlers/imageViewerHandler";
import { createWebviewPanel } from "@/utils/webview";
import { onDidReceiveInvoke } from "@/utils/message_host";
import { openImage } from "@/utils/image";

// -----------------------------------------------------------------------------------

type ImageViewerInitialData = { uri: string; metadata: Awaited<ReturnType<typeof openImage>> };
type ShowInfoAPI = { id: "showInfo"; handler: (info: string) => void };
type ShowErrorAPI = { id: "showError"; handler: (error: string) => void };
type CopyImageAPI = { id: "copyImage"; handler: () => void };
type EyeDropperAPI = { id: "eyeDropper"; handler: typeof handleEyeDropper };

export type { ImageViewerInitialData, ShowInfoAPI, ShowErrorAPI, CopyImageAPI, EyeDropperAPI };

// -----------------------------------------------------------------------------------

/**
 * 圖片檢視器自訂編輯器提供者
 */
class ImageViewerEditorProvider implements vscode.CustomReadonlyEditorProvider {
  /** 該插件的上下文，用於存取資源 */
  private readonly context: vscode.ExtensionContext;
  /** 用於儲存所有開啟的 image viewer webviews ，識別碼為 vscode.Uri.path (文件路徑)，只用於傳送重設縮放指令 */
  private readonly map: Map<string, vscode.WebviewPanel>;

  /**
   * 根據上下文與 webviewsMap 為插件建立一個圖片檢視器自訂編輯器提供者
   */
  constructor(context: vscode.ExtensionContext, map: Map<string, vscode.WebviewPanel>) {
    this.context = context;
    this.map = map;
  }

  /**
   * 開啟自訂文件 (無需額外處理)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async openCustomDocument(uri: vscode.Uri, _o: CustomDocumentOpenContext, _: CancellationToken) {
    return { uri, dispose: () => {} } as CustomDocument;
  }

  /**
   * 開啟自訂編輯器時要顯示的內容
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async resolveCustomEditor(document: CustomDocument, panel: WebviewPanel, _: CancellationToken) {
    const initialData: ImageViewerInitialData = {
      uri: panel.webview.asWebviewUri(document.uri).toString(),
      metadata: await openImage(document.uri.fsPath),
    };

    createWebviewPanel<ImageViewerInitialData>({
      panel,
      webviewType: "imageViewer",
      extensionUri: this.context.extensionUri,
      resourceUri: vscode.Uri.file(path.dirname(document.uri.fsPath)),
      initialData,
    });

    onDidReceiveInvoke<ShowInfoAPI>(panel, "showInfo", vscode.window.showInformationMessage);
    onDidReceiveInvoke<ShowErrorAPI>(panel, "showError", vscode.window.showErrorMessage);
    onDidReceiveInvoke<CopyImageAPI>(panel, "copyImage", () => handleCopyImage(document.uri.fsPath));
    onDidReceiveInvoke<EyeDropperAPI>(panel, "eyeDropper", handleEyeDropper);

    this.map.set(document.uri.fsPath, panel);
    const disposeListener = panel.onDidDispose(() => this.map.delete(document.uri.fsPath));

    this.context.subscriptions.push(disposeListener);
  }
}

export { ImageViewerEditorProvider };
