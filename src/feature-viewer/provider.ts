import * as vscode from "vscode";
import * as path from "path";
import type { CustomDocument, CustomDocumentOpenContext, WebviewPanel, CancellationToken } from "vscode";

import { createWebviewPanel } from "@/utils/vscode/webview";
import { registerInvokeEvents } from "@/utils/message/host";
import { openImage, type ImageMetadata } from "@/utils/host/image";
import { imageViewerService } from "@/feature-viewer/service";

/**
 * 圖片檢視器的延伸主機讀取初始資料型別
 */
export type ReadImageResult = { uri: string; metadata: ImageMetadata };

/**
 * 圖片檢視器自訂編輯器提供者
 */
class ImageViewerEditorProvider implements vscode.CustomReadonlyEditorProvider {
  /**
   * 擴展的上下文，用於存取資源
   */
  private readonly context: vscode.ExtensionContext;

  /**
   * 根據上下文為擴展建立一個圖片檢視器自訂編輯器提供者
   */
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
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
  async resolveCustomEditor(document: CustomDocument, panel: WebviewPanel, _: CancellationToken) {
    const metadata = await openImage(document.uri.fsPath);

    if (!metadata) {
      vscode.window.showErrorMessage("無法開啟圖片檢視器，圖片格式可能不受支援");
      return;
    }

    const initialData: ReadImageResult = {
      uri: panel.webview.asWebviewUri(document.uri).toString(),
      metadata,
    };

    const initializedPanel = createWebviewPanel<ReadImageResult>({
      context: this.context,
      panel: panel,
      jsBundleName: "imageViewer",
      jsInitialData: initialData,
      panelResources: [vscode.Uri.file(path.dirname(document.uri.fsPath))],
    });

    registerInvokeEvents(initializedPanel, imageViewerService);
  }
}

export { ImageViewerEditorProvider };
