import * as vscode from "vscode";
import { randomUUID } from "crypto";

import { checkMessage, createPanel } from "../providers/imageWallProvider";
import { type ExtendedMetadata, generateThumbnail, openImages } from "../utils/imageOpener";
import { formatPath, formatPathToArray } from "../utils/formatter";
import { copyImage } from "../utils/system_windows";

export function registerImageWallCommands(context: vscode.ExtensionContext) {
  const panelsMap = new Map<string, vscode.WebviewPanel>();

  const openImageWallFromExplorerCommand = vscode.commands.registerCommand(
    "1ureka.openImageWallFromExplorer",
    async (uri: vscode.Uri) => {
      if (!uri || !uri.fsPath) {
        vscode.window.showErrorMessage("請選擇一個資料夾來開啟圖片牆");
        return;
      }

      const panel = await openImageWall(context, uri.fsPath);
      const panelId = randomUUID();
      panelsMap.set(panelId, panel);
      panel.onDidDispose(() => panelsMap.delete(panelId));
    }
  );

  const openImageWallCommand = vscode.commands.registerCommand("1ureka.openImageWall", async () => {
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
    panel.onDidDispose(() => panelsMap.delete(panelId));
  });

  context.subscriptions.push(openImageWallFromExplorerCommand, openImageWallCommand);

  const createPreferenceCommandHandler = (preference: { mode?: string; size?: string }) => () => {
    panelsMap.forEach((panel) => panel.webview.postMessage({ type: "setPreference", preference }));
  };

  const preferenceCommandMap = {
    setLayoutStandard: { mode: "standard" },
    setLayoutWoven: { mode: "woven" },
    setLayoutMasonry: { mode: "masonry" },
    setSizeSmall: { size: "s" },
    setSizeMedium: { size: "m" },
    setSizeLarge: { size: "l" },
  };

  const preferenceCommands = Object.entries(preferenceCommandMap).map(([command, preference]) =>
    vscode.commands.registerCommand(`1ureka.imageWall.${command}`, createPreferenceCommandHandler(preference))
  );

  context.subscriptions.push(...preferenceCommands);
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
 * 處理前端要求的圖片相關事件的統一介面
 * @returns 回傳一個可能包含要回傳給前端的資料的 Promise 或不回傳任何東西
 */
type ImageHandler = (id: string, filePath: string) => Promise<Record<string, unknown> | void> | void;

/**
 * 所有圖片事件處理函式
 */
const imageHandlers: Record<string, ImageHandler> = {
  generateThumbnail: async (id, filePath) => {
    const base64 = await generateThumbnail(filePath);
    if (!base64) return;
    return { type: "thumbnailGenerated", id, base64 };
  },
  clickImage: (_, filePath) => {
    const uri = vscode.Uri.file(filePath);
    vscode.commands.executeCommand("vscode.open", uri, vscode.ViewColumn.Active);
  },
  copyImage: async (_, filePath) => {
    if (process.platform !== "win32") {
      const uri = vscode.Uri.file(filePath);
      await vscode.env.clipboard.writeText(uri.fsPath);
      vscode.window.showInformationMessage(`已複製圖片路徑: ${uri.fsPath}`);
      return;
    }

    const withProgressOptions: vscode.ProgressOptions = {
      location: vscode.ProgressLocation.Notification,
      title: "正在複製圖片",
      cancellable: false,
    };

    vscode.window.withProgress(withProgressOptions, async (progress) => {
      progress.report({ increment: 0, message: "讀取圖片中..." });

      try {
        await copyImage(filePath, (message, percent) => progress.report({ increment: percent, message }));
        const message = "圖片已複製到剪貼簿\n\n可以直接貼到其他應用中 (如 Word 、瀏覽器等)";
        progress.report({ increment: 100 });
        vscode.window.showInformationMessage(message);
      } catch (error) {
        const message = `複製圖片到剪貼簿失敗: ${error instanceof Error ? error.message : String(error)}`;
        vscode.window.showErrorMessage(message);
      }
    });
  },
};

/**
 * 讀取資料夾中的圖片並在 WebView 中顯示
 */
async function openImageWall(context: vscode.ExtensionContext, folderPath: string) {
  const imageMetadata = await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: "開啟圖片牆中", cancellable: false },
    (progress) => {
      let lastProgress = 0;

      return openImages(folderPath, (message, percent) => {
        const increment = percent - lastProgress;
        progress.report({ increment, message });
        lastProgress = percent;
      });
    }
  );

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
    const result = checkMessage(event);
    if (!result) {
      console.warn("Image Wall Extension Host: 接收到無效的訊息");
      return;
    }

    if (result.type === "ready") {
      webview.postMessage({ type: "initCompleted" });
      return;
    }

    if (result.type === "info") {
      vscode.window.showInformationMessage(result.message);
      return;
    }

    const { request } = result;
    const filePath = images.find(({ id }) => id === request.id)?.metadata.filePath;
    if (!filePath) return;

    const handler = imageHandlers[request.type];
    if (!handler) return;

    const response = await handler(request.id, filePath);
    if (response) webview.postMessage(response);
  });

  context.subscriptions.push(messageListener);

  return panel;
}
