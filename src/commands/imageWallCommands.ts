import * as vscode from "vscode";
import * as path from "path";
import { randomUUID } from "crypto";
import { generateReactHtml } from "../utils/webviewHelper";

import imageWallLight from "../icons/image-wall-light.svg";
import imageWallDark from "../icons/image-wall-dark.svg";
import { generateThumbnail, openImages } from "../utils/imageOpener";
import { formatPath } from "../utils/formatter";
import { copyImageWindows } from "../utils/systemClipboard";

export function registerImageWallCommands(context: vscode.ExtensionContext) {
  // 從檔案總管右鍵開啟圖片牆
  const openImageWallFromExplorerCommand = vscode.commands.registerCommand(
    "extension.openImageWallFromExplorer",
    (uri: vscode.Uri) => {
      if (uri && uri.fsPath) openImageWall(context, uri.fsPath);
    }
  );

  // 從命令面板開啟圖片牆
  // TODO: 改成支援多選資料夾
  const openImageWallCommand = vscode.commands.registerCommand("extension.openImageWall", async () => {
    const folders = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "選擇資料夾",
    });

    if (folders && folders.length > 0) openImageWall(context, folders[0].fsPath);
  });

  context.subscriptions.push(openImageWallFromExplorerCommand, openImageWallCommand);
}

/**
 * 該功能對應的 webviewType
 */
const WEBVIEW_TYPE = "imageWall";

/**
 * 建立 WebView 面板
 */
function createPanel(context: vscode.ExtensionContext, folderPath: string): vscode.Webview {
  const title = `圖片牆 - ${path.basename(folderPath)}`;
  const showOptions = vscode.ViewColumn.One;

  const panel = vscode.window.createWebviewPanel(WEBVIEW_TYPE, title, showOptions, {
    enableScripts: true,
    retainContextWhenHidden: true,
    localResourceRoots: [vscode.Uri.file(folderPath), context.extensionUri],
  });

  panel.iconPath = { light: vscode.Uri.parse(imageWallLight), dark: vscode.Uri.parse(imageWallDark) };
  return panel.webview;
}

/**
 * 檢查接收到的訊息格式是否正確
 */
function checkMessage(value: any): { type: string; id: string } | string | null {
  if (typeof value !== "object" || value === null) return null;
  const obj = value as Record<string, unknown>;

  const hasType = "type" in obj && typeof obj.type === "string";
  const hasId = "id" in obj && typeof obj.id === "string";

  if (hasType && hasId) return value;

  if (hasType && obj.type === "info" && "info" in obj && typeof obj.info === "string") {
    return obj.info;
  }

  return null;
}

/**
 * 讀取資料夾中的圖片並在 WebView 中顯示
 */
async function openImageWall(context: vscode.ExtensionContext, folderPath: string) {
  const webview = createPanel(context, folderPath);

  const imageMetadata = await openImages(folderPath);
  const images = imageMetadata.map((meta) => ({
    id: randomUUID(),
    metadata: meta,
  }));

  webview.html = generateReactHtml({
    webviewType: WEBVIEW_TYPE,
    webview,
    extensionUri: context.extensionUri,
    initialData: { folderPath: formatPath(folderPath), images },
  });

  const messageListener = webview.onDidReceiveMessage(async (event) => {
    const message = checkMessage(event);

    if (!message) {
      console.warn("Image Wall Extension Host: 接收到無效的訊息", message);
      return;
    }

    if (typeof message === "string") {
      vscode.window.showInformationMessage(message);
      return;
    }

    const filePath = images.find(({ id }) => id === message.id)?.metadata.filePath;
    if (!filePath) return;

    if (message.type === "imageClick") {
      const uri = vscode.Uri.file(filePath);
      vscode.commands.executeCommand("vscode.open", uri, vscode.ViewColumn.Active);
    }

    if (message.type === "generateImage") {
      const base64 = await generateThumbnail(filePath);
      if (!base64) return;
      webview.postMessage({ type: "imageGenerated", id: message.id, base64 });
    }

    if (message.type === "copyImage") {
      if (process.platform !== "win32") {
        const uri = vscode.Uri.file(filePath);
        await vscode.env.clipboard.writeText(uri.fsPath);
        vscode.window.showInformationMessage(`已複製圖片路徑: ${uri.fsPath}`);
        return;
      }

      try {
        await copyImageWindows(filePath);
        const message = "圖片已複製到剪貼簿\n\n可以直接貼到其他應用中 (如 Word 或是瀏覽器的 Google Keep, ChatGPT 等)";
        vscode.window.showInformationMessage(message);
      } catch (error) {
        const message = `複製圖片到剪貼簿失敗: ${error instanceof Error ? error.message : String(error)}`;
        vscode.window.showErrorMessage(message);
      }
    }
  });

  context.subscriptions.push(messageListener);
}
