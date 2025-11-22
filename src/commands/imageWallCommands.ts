import * as vscode from "vscode";
import * as path from "path";
import { randomUUID } from "crypto";
import { generateReactHtml } from "../utils/webviewHelper";

import imageWallLight from "../icons/image-wall-light.svg";
import imageWallDark from "../icons/image-wall-dark.svg";
import { generateBase64Image, openImages } from "../utils/imageOpener";
import { formatPath } from "../utils/pathFormatter";

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
function checkMessage(value: any): { type: string; id: string } | null {
  if (typeof value !== "object" || value === null) return null;

  const hasType = "type" in value && typeof value.type === "string";
  const hasId = "id" in value && typeof value.id === "string";

  if (hasType && hasId) return value;
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

    const filePath = images.find(({ id }) => id === message.id)?.metadata.filePath;
    if (!filePath) return;

    if (message.type === "imageClick") {
      const uri = vscode.Uri.file(filePath);
      vscode.commands.executeCommand("vscode.open", uri, vscode.ViewColumn.Active);
    }

    if (message.type === "generateImage") {
      const base64 = await generateBase64Image(filePath);
      if (!base64) return;
      webview.postMessage({ type: "imageGenerated", id: message.id, base64 });
    }
  });

  context.subscriptions.push(messageListener);
}
