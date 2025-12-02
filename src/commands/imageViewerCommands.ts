import * as vscode from "vscode";
import { ImageViewerEditorProvider } from "@/providers/imageViewerProvider";
import { forwardCommandToWebview } from "@/utils/message_host";
import { createCommandManager } from "@/utils/command";
import type { EyeDropperAPI, ExportImageAPI } from "@/providers/imageViewerProvider";
import type { ResetTransformAPI } from "@/webviews/imageViewer/data/events";

/**
 * 註冊圖片檢視器相關命令與編輯器
 */
function registerImageViewerCommands(context: vscode.ExtensionContext) {
  const provider = new ImageViewerEditorProvider(context);
  const providerRegistration = vscode.window.registerCustomEditorProvider("1ureka.imageViewer", provider, {
    webviewOptions: { retainContextWhenHidden: true },
    supportsMultipleEditorsPerDocument: false,
  });

  context.subscriptions.push(providerRegistration);

  const commandManager = createCommandManager(context);

  commandManager.register("1ureka.imageViewer.resetTransform", () => {
    const panel = provider.getCurrentPanel();
    if (panel) forwardCommandToWebview<ResetTransformAPI>(panel, "resetTransform");
  });

  commandManager.register("1ureka.imageViewer.eyeDropper", async () => {
    const panel = provider.getCurrentPanel();
    if (panel) forwardCommandToWebview<EyeDropperAPI>(panel, "eyeDropper");
  });

  commandManager.register("1ureka.imageViewer.exportAs", async () => {
    const panel = provider.getCurrentPanel();
    if (panel) forwardCommandToWebview<ExportImageAPI>(panel, "exportImage");
  });
}

export { registerImageViewerCommands };
