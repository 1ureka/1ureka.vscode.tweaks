import * as vscode from "vscode";
import { registerBlenderCommands } from "./commands/blenderCommands";
import { registerPainterCommands } from "./commands/painterCommands";
import { registerImageWallCommands } from "./commands/imageWallCommands";
import { FileTimestampProvider } from "./providers/fileTimestampProvider";

export function activate(context: vscode.ExtensionContext) {
  console.log("Extension activated");

  // 只在 Windows 上註冊 Blender 和 Painter 命令
  if (process.platform === "win32") {
    registerBlenderCommands(context);
    registerPainterCommands(context);
  }

  // 註冊圖片牆功能
  registerImageWallCommands(context);

  // 註冊檔案時間戳提供者
  const fileTimestampProvider = new FileTimestampProvider();
  fileTimestampProvider.register(context);
}

export function deactivate() {}
