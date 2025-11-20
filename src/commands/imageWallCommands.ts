import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

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
  // 直接創建 webview panel，而不是使用 custom editor
  const panel = vscode.window.createWebviewPanel(
    "imageWall",
    `圖片牆: ${path.basename(folderPath)}`,
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(folderPath)],
    }
  );

  updateWebviewContent(panel, folderPath);
}

function updateWebviewContent(panel: vscode.WebviewPanel, folderPath: string) {
  const images = getImagesFromFolder(folderPath);
  panel.webview.html = getHtmlForWebview(panel.webview, folderPath, images);
}

function getImagesFromFolder(folderPath: string): string[] {
  const supportedExtensions = [".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp", ".tiff", ".tif"];

  try {
    if (!fs.existsSync(folderPath)) {
      return [];
    }

    const files = fs.readdirSync(folderPath);
    const images: string[] = [];

    for (const file of files) {
      const fullPath = path.join(folderPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        if (supportedExtensions.includes(ext)) {
          images.push(fullPath);
        }
      }
    }

    return images;
  } catch (error) {
    console.error("讀取資料夾失敗:", error);
    return [];
  }
}

function getHtmlForWebview(webview: vscode.Webview, folderPath: string, images: string[]): string {
  const imageElements = images
    .map((imagePath) => {
      const uri = webview.asWebviewUri(vscode.Uri.file(imagePath));
      const fileName = path.basename(imagePath);
      return `
        <div class="image-item">
          <img src="${uri}" alt="${fileName}" />
          <div class="image-name">${fileName}</div>
        </div>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>圖片牆</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      font-family: var(--vscode-editor-font-family);
    }
    .header {
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .header h2 {
      margin: 0 0 10px 0;
      font-size: 1.2em;
    }
    .folder-path {
      font-size: 0.9em;
      opacity: 0.7;
    }
    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      padding: 10px 0;
    }
    .image-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      background-color: var(--vscode-editor-background);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .image-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    .image-item img {
      max-width: 100%;
      height: 200px;
      object-fit: contain;
      margin-bottom: 10px;
    }
    .image-name {
      font-size: 0.85em;
      text-align: center;
      word-break: break-all;
      opacity: 0.8;
    }
    .no-images {
      text-align: center;
      padding: 40px;
      opacity: 0.6;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>圖片牆</h2>
    <div class="folder-path">${folderPath}</div>
  </div>
  <div class="image-grid">
    ${imageElements || '<div class="no-images">此資料夾中沒有圖片</div>'}
  </div>
</body>
</html>`;
}
