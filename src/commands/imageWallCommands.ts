import * as vscode from "vscode";
import { ImageWallPanelProvider } from "@/providers/imageWallProvider";
import { createCommandManager } from "@/utils/command";

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

    if (!folders || folders.length === 0) vscode.window.showErrorMessage("請選擇一個資料夾來開啟圖片牆");
    else imageWallPanelProvider.createPanel(folders[0].fsPath);
  });

  commandManager.register("1ureka.imageWall.openImageWallFromFolder", (folderPath: string) => {
    imageWallPanelProvider.createPanel(folderPath);
  });

  // ------------------------------ Preference Commands ------------------------------

  const createPreferenceCommandHandler = (preference: { mode?: string; size?: string }) => () => {
    const panel = imageWallPanelProvider.getCurrentPanel();
    if (panel) panel.webview.postMessage({ type: "setPreference", preference });
  };

  const preferenceCommandMap = {
    setLayoutStandard: { mode: "standard" },
    setLayoutWoven: { mode: "woven" },
    setLayoutMasonry: { mode: "masonry" },
    setSizeSmall: { size: "s" },
    setSizeMedium: { size: "m" },
    setSizeLarge: { size: "l" },
  };

  Object.entries(preferenceCommandMap).map(([command, preference]) =>
    commandManager.register(`1ureka.imageWall.${command}`, createPreferenceCommandHandler(preference))
  );
}
