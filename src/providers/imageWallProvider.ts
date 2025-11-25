import * as vscode from "vscode";
import * as path from "path";

import { createWebviewPanel } from "../utils/webviewHelper";
import { handlePrepareInitialData, handlePreparePageData, imageHandlers } from "../handlers/imageWallHandlers";
import type { ImageWallInitialData } from "../handlers/imageWallHandlers";
import type { OneOf } from "../utils/type";

import imageWallLight from "../icons/image-wall-light.svg";
import imageWallDark from "../icons/image-wall-dark.svg";

type ImageWallMessage = OneOf<
  [{ type: "ready" }, { type: "image"; request: { type: string; id: string } }, { type: "info"; message: string }]
>;

/** 檢查接收到的訊息格式是否正確 */
function checkMessage(value: any): ImageWallMessage | null {
  if (typeof value !== "object" || value === null) return null;

  const { type, id, info } = value as Record<string, unknown>;
  if (typeof type !== "string") return null; // 訊息必須包含 type

  // webview 準備訊息
  if (type === "ready") return { type: "ready" };
  // 圖片相關訊息：包含 type 和 id
  if (typeof id === "string") return { type: "image", request: { type, id } };
  // 要求顯示資訊訊息
  if (type === "info" && typeof info === "string") return { type: "info", message: info };

  return null;
}

/**
 * 讀取資料夾中的圖片並在 WebView 中顯示
 */
async function createImageWallPanel(context: vscode.ExtensionContext, folderPath: string) {
  const { initialData, images } = await handlePrepareInitialData(folderPath);

  const panel = createWebviewPanel<ImageWallInitialData>({
    panelId: "1ureka.imageWall",
    panelTitle: `圖片牆 - ${path.basename(folderPath)}`,
    webviewType: "imageWall",
    extensionUri: context.extensionUri,
    resourceUri: vscode.Uri.file(folderPath),
    initialData,
    iconPath: { light: vscode.Uri.parse(imageWallLight), dark: vscode.Uri.parse(imageWallDark) },
  });

  const webview = panel.webview;

  const messageListener = webview.onDidReceiveMessage(async (event) => {
    const result = checkMessage(event);
    if (!result) {
      console.warn("Image Wall Extension Host: 接收到無效的訊息");
      return;
    }

    if (result.type === "ready") {
      handlePreparePageData({ webview, images, page: 1 });
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

export { createImageWallPanel };
