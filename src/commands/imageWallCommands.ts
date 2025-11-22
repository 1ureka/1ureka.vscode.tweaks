import * as vscode from "vscode";
import * as path from "path";
import { generateReactHtml } from "../utils/webviewHelper";

import imageWallLight from "../icons/image-wall-light.svg";
import imageWallDark from "../icons/image-wall-dark.svg";
import { openImages } from "../utils/imageOpener";

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
 * 將路徑轉換為陣列
 */
function pathToArray(inputPath: string): string[] {
  const normalized = path.normalize(inputPath);
  return normalized.split(path.sep).filter(Boolean);
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

  // 統一用 posix 路徑格式，Windows 太醜了
  const readableFolderPath = path.posix.join(...pathToArray(folderPath));
  const imageMetadata = await openImages(folderPath);
  const images = imageMetadata.map((meta) => ({
    metadata: meta,
    uri: panel.webview.asWebviewUri(vscode.Uri.file(meta.filePath)).toString(),
  }));

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
