import * as vscode from "vscode";
import * as path from "path";
import type { CustomDocument, CustomDocumentOpenContext, WebviewPanel, CancellationToken } from "vscode";

import { handleCopyImage, handleEyeDropper } from "../handlers/imageViewerHandler";
import { createWebviewPanel } from "../utils/webviewHelper";
import { openImage } from "../utils/imageOpener";
import type { OneOf } from "../utils/type";

/**
 * 由插件主機一開始就注入 html (類似 SSR) 的資料型別
 */
type ImageViewerInitialData = {
  uri: string;
  metadata: Awaited<ReturnType<typeof openImage>>;
};

/**
 * 前端傳送給後端的訊息型別
 */
type ImageViewerMessage = OneOf<
  [
    { type: "error"; error: string },
    { type: "info"; info: string },
    { type: "copy" },
    { type: "eyeDropper"; color: string }
  ]
>;

/**
 * 檢查前端傳送的訊息是否符合 ImageViewerMessage 型別
 */
const checkMessage = (message: any): message is ImageViewerMessage => {
  if (typeof message !== "object" || message === null || typeof message.type !== "string") {
    return false;
  }

  if (message.type === "error" && typeof message.error === "string") return true;
  if (message.type === "info" && typeof message.info === "string") return true;
  if (message.type === "copy") return true;
  if (message.type === "eyeDropper" && typeof message.color === "string") return true;

  return false;
};

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
  async openCustomDocument(uri: vscode.Uri, _o: CustomDocumentOpenContext, _: CancellationToken) {
    return { uri, dispose: () => {} } as CustomDocument;
  }

  /**
   * 開啟自訂編輯器時要顯示的內容
   */
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

    const messageListener = panel.webview.onDidReceiveMessage(async (message) => {
      if (!checkMessage(message)) return;

      const { type } = message;

      if (type === "error") {
        vscode.window.showErrorMessage(message.error);
      } else if (type === "info") {
        vscode.window.showInformationMessage(message.info);
      } else if (type === "copy") {
        handleCopyImage(document.uri.fsPath);
      } else if (type === "eyeDropper") {
        handleEyeDropper(message.color);
      }
    });

    this.map.set(document.uri.path, panel);
    const disposeListener = panel.onDidDispose(() => this.map.delete(document.uri.path));

    this.context.subscriptions.push(messageListener, disposeListener);
  }
}

export { ImageViewerEditorProvider };
export type { ImageViewerInitialData };
