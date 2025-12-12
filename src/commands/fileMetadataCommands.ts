import * as vscode from "vscode";
import { FileMetadataProvider } from "@/providers/fileMetadataProvider";

/**
 * 註冊檔案屬性相關邏輯
 */
export function registerFileMetadataCommands(context: vscode.ExtensionContext) {
  const fileMetadataProvider = FileMetadataProvider(context);

  /**  監聽 tab 變化 (同一分割視窗內切換分頁) */
  const changeTabsListener = vscode.window.tabGroups.onDidChangeTabs(() => {
    fileMetadataProvider.updateFromActiveTab();
  });
  /**  監聽 tab group 變化 (不同分割視窗間切換) */
  const changeTabGroupsListener = vscode.window.tabGroups.onDidChangeTabGroups(() => {
    fileMetadataProvider.updateFromActiveTab();
  });

  context.subscriptions.push(changeTabsListener, changeTabGroupsListener);

  fileMetadataProvider.updateFromActiveTab(); // 初始更新
}
