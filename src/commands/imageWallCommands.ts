import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";
import { generateReactHtml } from "../utils/webviewHelper";

import imageWallLight from "../icons/image-wall-light.svg";
import imageWallDark from "../icons/image-wall-dark.svg";

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
 * 讀取資料夾中的圖片並在 WebView 中顯示
 */
async function openImageWall(context: vscode.ExtensionContext, folderPath: string) {
  const viewType = "imageWall";
  const title = `圖片牆 - ${path.basename(folderPath)}`;
  const showOptions = vscode.ViewColumn.One;

  const panel = vscode.window.createWebviewPanel(viewType, title, showOptions, {
    enableScripts: true,
    retainContextWhenHidden: true,
    localResourceRoots: [vscode.Uri.file(folderPath), context.extensionUri],
  });

  panel.iconPath = { light: vscode.Uri.parse(imageWallLight), dark: vscode.Uri.parse(imageWallDark) };

  const imagePromises = getImagesFromFolder(folderPath).map(async ({ fileName, filePath }) => {
    const metadata = await sharp(filePath).metadata();
    return {
      metadata: { ...metadata, fileName, filePath },
      uri: panel.webview.asWebviewUri(vscode.Uri.file(filePath)).toString(),
    };
  });

  // TODO 用 vscode.Progress 顯示讀取進度
  const images = await Promise.all(imagePromises);
  const readableFolderPath = path.resolve(folderPath);

  panel.webview.html = generateReactHtml({
    webviewType: "imageWall",
    webview: panel.webview,
    extensionUri: context.extensionUri,
    initialData: { folderPath: readableFolderPath, images },
  });

  panel.webview.onDidReceiveMessage(
    (message) => {
      if (message.type === "imageClick" && message.filePath) {
        const uri = vscode.Uri.file(message.filePath);
        vscode.commands.executeCommand("vscode.open", uri, vscode.ViewColumn.Active);
      }
    },
    undefined,
    context.subscriptions
  );
}

/**
 * 讀取資料夾中的圖片檔案
 */
function getImagesFromFolder(folderPath: string) {
  const supportedExtensions = [".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp", ".tiff", ".tif"];

  try {
    if (!fs.existsSync(folderPath)) return [];

    const files = fs.readdirSync(folderPath);
    const images = [];

    for (const file of files) {
      const fullPath = path.join(folderPath, file);
      if (!fs.statSync(fullPath).isFile()) continue;

      const ext = path.extname(file).toLowerCase();
      if (!supportedExtensions.includes(ext)) continue;

      images.push({ filePath: fullPath, fileName: file });
    }

    return images;
  } catch (error) {
    console.error("讀取資料夾失敗:", error);
    return [];
  }
}
