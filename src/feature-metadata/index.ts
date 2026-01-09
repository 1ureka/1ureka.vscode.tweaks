import * as vscode from "vscode";
import type { ExtensionFeature } from "@/utils/vscode";
import { createStatusBarManager } from "@/feature-metadata/manager";

/**
 * 啟動檔案元資料顯示功能，監聽 tab 變化事件
 */
function activate(context: vscode.ExtensionContext) {
  const statusBarManager = createStatusBarManager(context);

  /**  監聽 tab 變化 (同一分割視窗內切換分頁) */
  const changeTabsListener = vscode.window.tabGroups.onDidChangeTabs(() => {
    statusBarManager.updateFromActiveTab();
  });
  /**  監聽 tab group 變化 (不同分割視窗間切換) */
  const changeTabGroupsListener = vscode.window.tabGroups.onDidChangeTabGroups(() => {
    statusBarManager.updateFromActiveTab();
  });

  context.subscriptions.push(changeTabsListener, changeTabGroupsListener);

  statusBarManager.updateFromActiveTab(); // 初始更新
}

/**
 * 檔案元資料顯示功能模組
 */
const feature: ExtensionFeature = {
  activate,
};

export default feature;
