import * as vscode from "vscode";
import { randomUUID } from "crypto";
import { createImageWallPanel } from "../providers/imageWallProvider";

export function registerImageWallCommands(context: vscode.ExtensionContext) {
  const panelsMap = new Map<string, vscode.WebviewPanel>();

  const openPanel = async (folderPath: string) => {
    const panel = await createImageWallPanel(context, folderPath);
    const panelId = randomUUID();
    panelsMap.set(panelId, panel);
    panel.onDidDispose(() => panelsMap.delete(panelId));
  };

  const openFromExplorer = (uri: vscode.Uri) => {
    if (!uri || !uri.fsPath) vscode.window.showErrorMessage("請選擇一個資料夾來開啟圖片牆");
    else openPanel(uri.fsPath);
  };

  const openFromCommandPalette = async () => {
    const folders = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "選擇資料夾",
    });

    if (!folders || folders.length === 0) vscode.window.showErrorMessage("請選擇一個資料夾來開啟圖片牆");
    else openPanel(folders[0].fsPath);
  };

  const openFromExplorerCommand = vscode.commands.registerCommand("1ureka.openImageWallFromExplorer", openFromExplorer);
  const openFromCommandPaletteCommand = vscode.commands.registerCommand("1ureka.openImageWall", openFromCommandPalette);

  context.subscriptions.push(openFromExplorerCommand, openFromCommandPaletteCommand);

  // ------------------------------ Preference Commands ------------------------------

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
