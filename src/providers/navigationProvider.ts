import * as vscode from "vscode";
import type { CommandId } from "@/contribute";

/**
 * 選項介面
 */
interface NavigationOption extends vscode.QuickPickItem {
  nextStep?: "externalApp";
  commandId?: CommandId;
}

/**
 * 可供選擇的格式選項 (主要導航選單)
 */
const navigationOptions: NavigationOption[] = [
  {
    label: "系統瀏覽器",
    kind: vscode.QuickPickItemKind.Separator,
  },
  {
    iconPath: new vscode.ThemeIcon("folder-library"),
    label: "系統瀏覽器",
    description: "$(root-folder) 當前目錄",
    detail: "使用系統瀏覽器開啟當前工作目錄",
    commandId: "1ureka.fileSystem.openFromPath",
  },
  {
    iconPath: new vscode.ThemeIcon("folder-library"),
    label: "系統瀏覽器",
    description: "$(link-external) 指定目錄",
    detail: "在預設的瀏覽器中選擇目錄後以系統瀏覽器開啟",
    commandId: "1ureka.fileSystem.openFromDialog",
  },
  {
    label: "圖片牆",
    kind: vscode.QuickPickItemKind.Separator,
  },
  {
    iconPath: new vscode.ThemeIcon("book"),
    label: "圖片牆",
    description: "$(root-folder) 當前目錄",
    detail: "在圖片牆中瀏覽當前目錄的圖片檔案",
    commandId: "1ureka.imageWall.openFromPath",
  },
  {
    iconPath: new vscode.ThemeIcon("book"),
    label: "圖片牆",
    description: "$(link-external) 指定目錄",
    detail: "在預設的瀏覽器中選擇目錄後以圖片牆開啟",
    commandId: "1ureka.imageWall.openFromDialog",
  },
  {
    label: "外部應用程式",
    kind: vscode.QuickPickItemKind.Separator,
  },
  {
    iconPath: new vscode.ThemeIcon("milestone"),
    label: "快速開啟",
    description: "開啟指定的外部應用程式",
    detail: "將會開啟一個列出所有支援的外部應用程式清單供選擇",
    nextStep: "externalApp",
  },
];

/**
 * 可供選擇的格式選項 (外部應用程式選單)
 */
const externalAppOptions: NavigationOption[] = [
  {
    iconPath: new vscode.ThemeIcon("symbol-method"),
    label: "開啟 Blender",
    commandId: "1ureka.external.openBlender",
  },
  {
    iconPath: new vscode.ThemeIcon("symbol-color"),
    label: "開啟 Substance 3D Painter",
    commandId: "1ureka.external.openPainter",
  },
];

/**
 * 開啟導航選單
 */
const openNavigationMenu = async () => {
  const pickerOptions = { placeHolder: "選擇目標", title: "快速前往" };
  const navigationOption = await vscode.window.showQuickPick(navigationOptions, pickerOptions);

  if (!navigationOption) {
    return;
  }

  if (navigationOption.nextStep === "externalApp") {
    const externalAppOption = await vscode.window.showQuickPick(externalAppOptions, pickerOptions);
    if (!externalAppOption || !externalAppOption.commandId) return;
    vscode.commands.executeCommand(externalAppOption.commandId);
    return;
  }

  if (navigationOption.commandId) {
    vscode.commands.executeCommand(navigationOption.commandId);
  }
};

export { openNavigationMenu };
