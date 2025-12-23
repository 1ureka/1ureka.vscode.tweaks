import * as vscode from "vscode";
import type { CommandId } from "@/contribute";

/**
 * 選項介面
 */
interface NavigationOption extends vscode.QuickPickItem {
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

  if (navigationOption.commandId) {
    vscode.commands.executeCommand(navigationOption.commandId);
  }
};

export { openNavigationMenu };
