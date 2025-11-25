import * as vscode from "vscode";
import * as path from "path";

import imageWallLight from "../icons/image-wall-light.svg";
import imageWallDark from "../icons/image-wall-dark.svg";
import { createWebviewPanel } from "../utils/webviewHelper";
import type { ImageWallInitialData } from "../commands/imageWallCommands";
import type { OneOf } from "../utils/type";

/**
 * 該功能對應的 webviewType
 */
const WEBVIEW_TYPE = "imageWall";
const WEBVIEW_VIEW_ID = "1ureka" + "." + WEBVIEW_TYPE;

/**
 * 建立 WebView 面板
 */
type CreatePanel = (params: {
  context: vscode.ExtensionContext;
  folderPath: string;
  initialData: ImageWallInitialData;
}) => vscode.WebviewPanel;

/**
 * 建立 WebView 面板
 */
const createPanel: CreatePanel = ({ context, folderPath, initialData }) => {
  const panel = createWebviewPanel<ImageWallInitialData>({
    panelId: WEBVIEW_VIEW_ID,
    panelTitle: `圖片牆 - ${path.basename(folderPath)}`,
    webviewType: WEBVIEW_TYPE,
    extensionUri: context.extensionUri,
    resourceUri: vscode.Uri.file(folderPath),
    initialData,
    iconPath: { light: vscode.Uri.parse(imageWallLight), dark: vscode.Uri.parse(imageWallDark) },
  });

  return panel;
};

type Message = OneOf<
  [{ type: "ready" }, { type: "image"; request: { type: string; id: string } }, { type: "info"; message: string }]
>;

/**
 * 檢查接收到的訊息格式是否正確
 */
function checkMessage(value: any): Message | null {
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

export { createPanel, checkMessage };
