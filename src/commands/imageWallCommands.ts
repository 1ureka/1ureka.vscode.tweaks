import * as vscode from "vscode";
import { randomUUID } from "crypto";

import { checkMessage, createPanel } from "../providers/imageWallProvider";
import { type ExtendedMetadata, generateThumbnail, openImages } from "../utils/imageOpener";
import { formatPath, formatPathToArray } from "../utils/formatter";
import { copyImage } from "../utils/system_windows";

export function registerImageWallCommands(context: vscode.ExtensionContext) {
  const panelsMap = new Map<string, vscode.WebviewPanel>();

  // 從檔案總管右鍵開啟圖片牆
  const openImageWallFromExplorerCommand = vscode.commands.registerCommand(
    "extension.openImageWallFromExplorer",
    async (uri: vscode.Uri) => {
      if (!uri || !uri.fsPath) {
        vscode.window.showErrorMessage("請選擇一個資料夾來開啟圖片牆");
        return;
      }

      const panel = await openImageWall(context, uri.fsPath);
      const panelId = randomUUID();
      panelsMap.set(panelId, panel);

      panel.onDidDispose(() => {
        panelsMap.delete(panelId);
      });
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

    if (!folders || folders.length === 0) {
      vscode.window.showErrorMessage("請選擇一個資料夾來開啟圖片牆");
      return;
    }

    const panel = await openImageWall(context, folders[0].fsPath);
    const panelId = randomUUID();
    panelsMap.set(panelId, panel);

    panel.onDidDispose(() => {
      panelsMap.delete(panelId);
    });
  });

  context.subscriptions.push(openImageWallFromExplorerCommand, openImageWallCommand);

  const createPreferenceCommandHandler = (preference: { mode?: string; size?: string }) => () => {
    panelsMap.forEach((panel) => {
      panel.webview.postMessage({
        type: "setPreference",
        preference,
      });
    });
  };

  const setLayoutCommand1 = vscode.commands.registerCommand(
    "extension.imageWall.setLayoutStandard",
    createPreferenceCommandHandler({ mode: "standard" })
  );

  const setLayoutCommand2 = vscode.commands.registerCommand(
    "extension.imageWall.setLayoutWoven",
    createPreferenceCommandHandler({ mode: "woven" })
  );

  const setLayoutCommand3 = vscode.commands.registerCommand(
    "extension.imageWall.setLayoutMasonry",
    createPreferenceCommandHandler({ mode: "masonry" })
  );

  context.subscriptions.push(setLayoutCommand1, setLayoutCommand2, setLayoutCommand3);

  const setSizeCommand1 = vscode.commands.registerCommand(
    "extension.imageWall.setSizeSmall",
    createPreferenceCommandHandler({ size: "s" })
  );

  const setSizeCommand2 = vscode.commands.registerCommand(
    "extension.imageWall.setSizeMedium",
    createPreferenceCommandHandler({ size: "m" })
  );

  const setSizeCommand3 = vscode.commands.registerCommand(
    "extension.imageWall.setSizeLarge",
    createPreferenceCommandHandler({ size: "l" })
  );

  context.subscriptions.push(setSizeCommand1, setSizeCommand2, setSizeCommand3);
}

/**
 * 該功能對應的 WebView 的初始資料型別
 */
export type ImageWallInitialData = {
  images: { id: `${string}-${string}-${string}-${string}-${string}`; metadata: ExtendedMetadata }[];
  folderPath: string;
  folderPathParts: string[];
};

/**
 * 讀取資料夾中的圖片並在 WebView 中顯示
 */
async function openImageWall(context: vscode.ExtensionContext, folderPath: string) {
  const imageMetadata = await openImages(folderPath);
  const images = imageMetadata.map((meta) => ({
    id: randomUUID(),
    metadata: meta,
  }));

  const initialData: ImageWallInitialData = {
    folderPath: formatPath(folderPath),
    folderPathParts: formatPathToArray(folderPath),
    images,
  };

  const panel = createPanel({ context, folderPath, initialData });
  const webview = panel.webview;

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
        await copyImage(filePath);
        const message = "圖片已複製到剪貼簿\n\n可以直接貼到其他應用中 (如 Word 或是瀏覽器的 Google Keep, ChatGPT 等)";
        vscode.window.showInformationMessage(message);
      } catch (error) {
        const message = `複製圖片到剪貼簿失敗: ${error instanceof Error ? error.message : String(error)}`;
        vscode.window.showErrorMessage(message);
      }
    }
  });

  context.subscriptions.push(messageListener);

  return panel;
}
