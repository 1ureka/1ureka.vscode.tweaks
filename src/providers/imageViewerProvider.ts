import * as vscode from "vscode";
import * as path from "path";
import type { CustomDocument, CustomDocumentOpenContext, WebviewPanel, CancellationToken } from "vscode";

import { handleCopyImage, handleExportImage, handleEyeDropper } from "../handlers/imageViewerHandler";
import { createWebviewPanel } from "../utils/webviewHelper";
import { type ExportFormat, openImage } from "../utils/imageOpener";
import type { OneOf } from "@/utils";

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

    this.map.set(document.uri.fsPath, panel);
    const disposeListener = panel.onDidDispose(() => this.map.delete(document.uri.fsPath));

    this.context.subscriptions.push(messageListener, disposeListener);
  }
}

/**
 * 格式選項介面
 */
interface FormatOption extends vscode.QuickPickItem {
  format: ExportFormat;
  extension: string;
}

/**
 * 可供選擇的格式選項
 */
const formatOptions: FormatOption[] = [
  {
    label: "PNG",
    description: "無損壓縮，支援透明度",
    detail: "適合需要透明背景的圖片",
    format: "png",
    extension: ".png",
  },
  {
    label: "JPEG",
    description: "有損壓縮，檔案較小",
    detail: "適合相片或不需要透明度的圖片",
    format: "jpeg",
    extension: ".jpg",
  },
  {
    label: "WebP",
    description: "現代格式，壓縮率高",
    detail: "有損壓縮，品質優於 JPEG ，且支援透明度",
    format: "webp",
    extension: ".webp",
  },
  {
    label: "WebP (無損)",
    description: "無損壓縮，支援透明度",
    detail: "若應用程式支援，相比 PNG 其檔案通常更小但品質相同",
    format: "webp-lossless",
    extension: ".webp",
  },
];

/**
 * 開啟導出圖片流程
 */
const startExportImage = async (imagePath: string) => {
  const pickerOptions = { placeHolder: "選擇導出格式", title: "圖片導出格式" };
  const formatOption = await vscode.window.showQuickPick(formatOptions, pickerOptions);
  if (!formatOption) return;

  const sourceName = path.basename(imagePath, path.extname(imagePath));
  const defaultFileName = `${sourceName}${formatOption.extension}`;

  const uri = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file(path.join(path.dirname(imagePath), defaultFileName)),
    filters: { Images: [formatOption.extension.replace(".", "")] },
    saveLabel: "導出",
    title: `導出為 ${formatOption.label}`,
  });

  if (!uri) return;

  return handleExportImage(imagePath, uri.fsPath, formatOption.format);
};

export { ImageViewerEditorProvider, startExportImage };
export type { ImageViewerInitialData };
