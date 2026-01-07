import * as vscode from "vscode";
import * as path from "path";
import type { CustomDocument, CustomDocumentOpenContext, WebviewPanel, CancellationToken } from "vscode";

import { handleCopyImage } from "@/feature-viewer/handlers";
import { createWebviewPanelManager } from "@/utils/vscode/webview";
import { registerInvokeEvents } from "@/utils/vscode/message/host";
import { exportImage, openImage } from "@/utils/host/image";
import type { ExportFormat, ImageMetadata } from "@/utils/host/image";

// ---------------------------------------------------------------------------------

/**
 * 圖片檢視器的延伸主機讀取初始資料型別
 */
type ReadImageResult = { uri: string; metadata: ImageMetadata };

export type { ReadImageResult };

// ---------------------------------------------------------------------------------

const showInfo = (message: string) => {
  vscode.window.showInformationMessage(message);
};

const showError = (message: string) => {
  vscode.window.showErrorMessage(message);
};

const writeClipboard = async (text: string) => {
  await vscode.env.clipboard.writeText(text);
};

/** 產生 withProgress 選項 */
const generateProgressOptions = (title: string) => {
  return { title, location: vscode.ProgressLocation.Notification, cancellable: false };
};

/** 格式選項介面 */
type FormatOption = vscode.QuickPickItem & { format: ExportFormat; extension: string };

/** 導出圖片時可供選擇的格式選項 */
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

// ---------------------------------------------------------------------------------

/** 處理複製圖片到剪貼簿的流程 */
async function copyImage(filePath: string) {
  if (process.platform !== "win32") {
    await vscode.env.clipboard.writeText(filePath);
    vscode.window.showInformationMessage(`已複製圖片路徑: ${filePath}`);
    return;
  }

  await vscode.window.withProgress(generateProgressOptions("正在複製圖片"), async (progress) => {
    try {
      await handleCopyImage(filePath, (params) => progress.report(params));
      vscode.window.showInformationMessage("圖片二進位資料已複製到剪貼簿");
    } catch (error) {
      const message = `複製圖片到剪貼簿失敗: ${error instanceof Error ? error.message : String(error)}`;
      vscode.window.showErrorMessage(message);
    }
  });
}

/** 處理導出圖片的流程 */
async function executeExportWorkflow(filePath: string) {
  const formatOption = await vscode.window.showQuickPick(formatOptions, {
    placeHolder: "選擇導出格式",
    title: "圖片導出格式",
  });

  if (!formatOption) return;

  const sourceName = path.basename(filePath, path.extname(filePath));
  const defaultFileName = `${sourceName}${formatOption.extension}`;

  const uri = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file(path.join(path.dirname(filePath), defaultFileName)),
    filters: { Images: [formatOption.extension.replace(".", "")] },
    saveLabel: "導出",
    title: `導出為 ${formatOption.label}`,
  });

  if (!uri) return;

  const sourcePath = filePath;
  const savePath = uri.fsPath;
  const format = formatOption.format;

  await vscode.window.withProgress(generateProgressOptions("正在導出圖片"), async (progress) => {
    try {
      await exportImage({ report: (params) => progress.report(params), sourcePath, savePath, format });

      const openAction = "開啟檔案";
      const result = await vscode.window.showInformationMessage(`圖片已成功導出至：\n${savePath}`, openAction);
      if (result === openAction) {
        await vscode.commands.executeCommand("vscode.open", vscode.Uri.file(savePath));
      }
    } catch (error) {
      const message = `導出圖片失敗: ${error instanceof Error ? error.message : String(error)}`;
      vscode.window.showErrorMessage(message);
    }
  });
}

// ---------------------------------------------------------------------------------

const imageViewerAPI = {
  "show.info": showInfo,
  "show.error": showError,

  "image.copy": copyImage,
  "image.export": executeExportWorkflow,
  "image.copyColor": async (color: string) => {
    await writeClipboard(color);
    vscode.window.showInformationMessage(`選取的顏色 ${color} 已複製到剪貼簿`);
  },
};

type ImageViewerAPI = typeof imageViewerAPI;

// ---------------------------------------------------------------------------------

/**
 * 圖片檢視器自訂編輯器提供者
 */
class ImageViewerEditorProvider implements vscode.CustomReadonlyEditorProvider {
  /** 該插件的上下文，用於存取資源 */
  private readonly context: vscode.ExtensionContext;
  private readonly panelManager: ReturnType<typeof createWebviewPanelManager>;

  /** 根據上下文與 webviewsMap 為插件建立一個圖片檢視器自訂編輯器提供者 */
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.panelManager = createWebviewPanelManager(context);
  }

  /** 取得目前活動的圖片檢視器面板 */
  getCurrentPanel() {
    return this.panelManager.getCurrent();
  }

  /** 開啟自訂文件 (無需額外處理) */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async openCustomDocument(uri: vscode.Uri, _1: CustomDocumentOpenContext, _2: CancellationToken) {
    return { uri, dispose: () => {} } as CustomDocument;
  }

  /** 開啟自訂編輯器時要顯示的內容 */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async resolveCustomEditor(document: CustomDocument, panelFromParams: WebviewPanel, _: CancellationToken) {
    const metadata = await openImage(document.uri.fsPath);

    if (!metadata) {
      vscode.window.showErrorMessage("無法開啟圖片檢視器，圖片格式可能不受支援");
      return;
    }

    const initialData: ReadImageResult = {
      uri: panelFromParams.webview.asWebviewUri(document.uri).toString(),
      metadata,
    };

    const panel = this.panelManager.create<ReadImageResult>({
      panel: panelFromParams,
      webviewType: "imageViewer",
      extensionUri: this.context.extensionUri,
      resourceUri: vscode.Uri.file(path.dirname(document.uri.fsPath)),
      initialData,
    });

    registerInvokeEvents(panel, imageViewerAPI);
  }
}

export { ImageViewerEditorProvider, type ImageViewerAPI };
