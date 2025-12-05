import * as vscode from "vscode";
import { ImageWallPanelProvider } from "@/providers/imageWallProvider";
import { createCommandManager } from "@/utils/command";
import { forwardCommandToWebview } from "@/utils/message_host";
import type { SetModeStandardAPI, SetModeMasonryAPI, SetModeWovenAPI } from "@/webviews/imageWall/data/preference";
import type { SetSizeLargeAPI, SetSizeMediumAPI, SetSizeSmallAPI } from "@/webviews/imageWall/data/preference";

export function registerImageWallCommands(context: vscode.ExtensionContext) {
  const commandManager = createCommandManager(context);
  const imageWallPanelProvider = ImageWallPanelProvider(context);

  commandManager.register("1ureka.openImageWallFromExplorer", (uri: vscode.Uri) => {
    if (!uri || !uri.fsPath) vscode.window.showErrorMessage("請選擇一個資料夾來開啟圖片牆");
    else imageWallPanelProvider.createPanel(uri.fsPath);
  });

  commandManager.register("1ureka.openImageWall", async () => {
    const folders = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "選擇資料夾",
    });

    if (!folders || folders.length === 0) return;
    else imageWallPanelProvider.createPanel(folders[0].fsPath);
  });

  commandManager.registerInternal("1ureka.imageWall.openImageWallFromFolder", (folderPath: string) => {
    imageWallPanelProvider.createPanel(folderPath);
  });

  commandManager.register("1ureka.imageWall.setLayoutStandard", () => {
    const panel = imageWallPanelProvider.getCurrentPanel();
    if (panel) forwardCommandToWebview<SetModeStandardAPI>(panel, "setModeStandard");
  });

  commandManager.register("1ureka.imageWall.setLayoutMasonry", () => {
    const panel = imageWallPanelProvider.getCurrentPanel();
    if (panel) forwardCommandToWebview<SetModeMasonryAPI>(panel, "setModeMasonry");
  });

  commandManager.register("1ureka.imageWall.setLayoutWoven", () => {
    const panel = imageWallPanelProvider.getCurrentPanel();
    if (panel) forwardCommandToWebview<SetModeWovenAPI>(panel, "setModeWoven");
  });

  commandManager.register("1ureka.imageWall.setSizeSmall", () => {
    const panel = imageWallPanelProvider.getCurrentPanel();
    if (panel) forwardCommandToWebview<SetSizeSmallAPI>(panel, "setSizeSmall");
  });

  commandManager.register("1ureka.imageWall.setSizeMedium", () => {
    const panel = imageWallPanelProvider.getCurrentPanel();
    if (panel) forwardCommandToWebview<SetSizeMediumAPI>(panel, "setSizeMedium");
  });

  commandManager.register("1ureka.imageWall.setSizeLarge", () => {
    const panel = imageWallPanelProvider.getCurrentPanel();
    if (panel) forwardCommandToWebview<SetSizeLargeAPI>(panel, "setSizeLarge");
  });
}
