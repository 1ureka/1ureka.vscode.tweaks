import * as vscode from "vscode";
import * as path from "path";
import { renderWebviewHtml } from "@/file-intercept/renderer";
import fileTextSvg from "@/assets/file-text.svg";
import videoSvg from "@/assets/video.svg";
import headphonesSvg from "@/assets/headphones.svg";

/**
 * 檔案分類定義
 */
type FileCategory = {
  extensions: string[];
  icon: string;
};

/**
 * 攔截的檔案分類與對應圖示
 */
const categories: FileCategory[] = [
  { extensions: [".pdf"], icon: fileTextSvg },
  { extensions: [".mp4", ".avi", ".mkv", ".mov", ".wmv", ".flv", ".webm"], icon: videoSvg },
  { extensions: [".mp3", ".wav", ".flac", ".aac", ".ogg", ".wma", ".m4a"], icon: headphonesSvg },
];

/**
 * 根據副檔名取得對應分類
 */
function getCategoryByExt(ext: string): FileCategory | undefined {
  return categories.find((c) => c.extensions.includes(ext));
}

/**
 * 取得所有攔截的副檔名清單
 */
function getAllExtensions(): string[] {
  return categories.flatMap((c) => c.extensions);
}

/**
 * 自訂唯讀文件，用於 CustomReadonlyEditorProvider
 */
class InterceptDocument implements vscode.CustomDocument {
  constructor(public readonly uri: vscode.Uri) {}
  dispose() {}
}

/**
 * 檔案攔截 Webview 的 Provider，攔截特定二進位 / 媒體檔案，以 Webview 取代預設的文本編輯器
 */
class FileInterceptProvider implements vscode.CustomReadonlyEditorProvider<InterceptDocument> {
  openCustomDocument(uri: vscode.Uri): InterceptDocument {
    return new InterceptDocument(uri);
  }

  resolveCustomEditor(document: InterceptDocument, webviewPanel: vscode.WebviewPanel): void {
    const ext = path.extname(document.uri.fsPath).toLowerCase();
    const category = getCategoryByExt(ext);
    const icon = category?.icon ?? fileTextSvg;
    const fileName = path.basename(document.uri.fsPath);

    webviewPanel.webview.options = { enableScripts: true };
    webviewPanel.webview.html = renderWebviewHtml(fileName, icon);

    webviewPanel.webview.onDidReceiveMessage((message) => {
      if (message.type === "open") {
        vscode.commands.executeCommand("1ureka.vscode.openWithSystemDefaultApp", document.uri);
      }
    });
  }
}

export { FileInterceptProvider, getAllExtensions };
