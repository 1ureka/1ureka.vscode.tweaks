import * as vscode from "vscode";
import { ImageWallPanelProvider } from "@/providers/imageWallProvider";
import { createCommandManager } from "@/utils/command";
import { forwardCommandToWebview } from "@/utils/message_host";
import type { SetModeStandardAPI, SetModeMasonryAPI, SetModeWovenAPI } from "@/webviews/imageWall/data/preference";
import type { SetSizeLargeAPI, SetSizeMediumAPI, SetSizeSmallAPI } from "@/webviews/imageWall/data/preference";

export function registerImageWallCommands(context: vscode.ExtensionContext) {
  const commandManager = createCommandManager(context);
  const imageWallPanelProvider = ImageWallPanelProvider(context);

  commandManager.register("1ureka.imageWall.openFromPath", async (params: vscode.Uri | string | undefined) => {
    if (params instanceof vscode.Uri) {
      imageWallPanelProvider.createPanel(params.fsPath);
    } else if (typeof params === "string") {
      imageWallPanelProvider.createPanel(params);
    } else {
      const { workspaceFolders } = vscode.workspace;
      if (workspaceFolders?.length) {
        imageWallPanelProvider.createPanel(workspaceFolders[0].uri.fsPath);
      } else {
        vscode.window.showErrorMessage("請提供資料夾路徑或先開啟一個工作區資料夾");
      }
    }
  });

  commandManager.register("1ureka.imageWall.openFromDialog", async () => {
    const folders = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "選擇資料夾",
    });

    if (!folders || folders.length === 0) return;
    else imageWallPanelProvider.createPanel(folders[0].fsPath);
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
