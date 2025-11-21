import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { getReactWebviewHtml, setupWebviewMessageHandler, postMessageToWebview } from "../utils/webviewHelper";

import imageWallLight from "../icons/image-wall-light.svg";
import imageWallDark from "../icons/image-wall-dark.svg";

interface ImageInfo {
  uri: string;
  fileName: string;
}

interface ImageWallState {
  images: ImageInfo[];
  folderPath: string;
}

export function registerImageWallCommands(context: vscode.ExtensionContext) {
  // 從檔案總管右鍵開啟圖片牆
  const openImageWallFromExplorerCommand = vscode.commands.registerCommand(
    "extension.openImageWallFromExplorer",
    (uri: vscode.Uri) => {
      if (uri && uri.fsPath) {
        openImageWall(context, uri.fsPath);
      }
    }
  );

  // 從命令面板開啟圖片牆
  const openImageWallCommand = vscode.commands.registerCommand("extension.openImageWall", async () => {
    const folders = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "選擇資料夾",
    });

    if (folders && folders.length > 0) {
      openImageWall(context, folders[0].fsPath);
    }
  });

  context.subscriptions.push(openImageWallFromExplorerCommand, openImageWallCommand);
}

function openImageWall(context: vscode.ExtensionContext, folderPath: string) {
  const viewType = "imageWall";
  const title = `圖片牆 - ${path.basename(folderPath)}`;
  const showOptions = vscode.ViewColumn.One;

  const panel = vscode.window.createWebviewPanel(viewType, title, showOptions, {
    enableScripts: true,
    retainContextWhenHidden: true,
    localResourceRoots: [vscode.Uri.file(folderPath), context.extensionUri],
  });

  panel.iconPath = { light: vscode.Uri.parse(imageWallLight), dark: vscode.Uri.parse(imageWallDark) };
  panel.webview.html = getReactWebviewHtml(panel.webview, context.extensionUri, "imageWall.js", "圖片牆");

  // 設置消息處理器
  setupWebviewMessageHandler<void>(panel, (message) => {
    if (message.type === "ready") {
      const images = getImagesFromFolder(folderPath, panel.webview);
      const state: ImageWallState = { images, folderPath };
      postMessageToWebview(panel, { type: "update", payload: state });
    }
  });
}

function getImagesFromFolder(folderPath: string, webview: vscode.Webview): ImageInfo[] {
  const supportedExtensions = [".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp", ".tiff", ".tif"];

  try {
    if (!fs.existsSync(folderPath)) {
      return [];
    }

    const files = fs.readdirSync(folderPath);
    const images: ImageInfo[] = [];

    for (const file of files) {
      const fullPath = path.join(folderPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        if (supportedExtensions.includes(ext)) {
          const uri = webview.asWebviewUri(vscode.Uri.file(fullPath)).toString();
          images.push({
            uri,
            fileName: file,
          });
        }
      }
    }

    return images;
  } catch (error) {
    console.error("讀取資料夾失敗:", error);
    return [];
  }
}
