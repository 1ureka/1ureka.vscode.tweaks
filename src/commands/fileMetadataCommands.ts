import * as vscode from "vscode";
import { setImageStatusBar, setFileStatusBar } from "../providers/fileMetadataProvider";
import { handleGetFileMetadata } from "../handlers/fileMetadataHandlers";

/**
 * 根據給定的 URI 更新狀態列顯示
 */
async function updateStatusBarFromUri(statusBarItem: vscode.StatusBarItem, uri: vscode.Uri | undefined) {
  if (!uri || uri.scheme !== "file") {
    statusBarItem.hide();
    return;
  }

  const info = await handleGetFileMetadata(uri.fsPath);
  if (!info) {
    statusBarItem.hide();
    return;
  }

  if ("width" in info && "height" in info) setImageStatusBar(statusBarItem, info);
  else setFileStatusBar(statusBarItem, info);
}

/**
 * 從目前活動的分頁更新狀態列顯示
 */
async function updateFromActiveTab(statusBarItem: vscode.StatusBarItem) {
  const activeTab = vscode.window.tabGroups.activeTabGroup?.activeTab;
  if (!activeTab) {
    statusBarItem.hide();
    return;
  }

  // 根據實測，不管是可以打開的 *.js, *.ts，還是不可能打開的 *.blend, *.fbx，又或是處在中間的 *.png, *.jpg等
  // 也就是任何檔案類型的 Tab input 都必定包含 uri 屬性
  // 而像是 Thunder client 頁面, 歡迎頁面等則沒有
  // 這剛好符合我們的需求，對任意檔案顯示其元資料，對非檔案則不顯示
  const input = activeTab.input;
  if (input && typeof input === "object") {
    if ("uri" in input && input.uri instanceof vscode.Uri) {
      await updateStatusBarFromUri(statusBarItem, input.uri);
      return;
    }
  }
}

/**
 * 註冊檔案屬性相關邏輯
 */
export function registerFileMetadataCommands(context: vscode.ExtensionContext) {
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  context.subscriptions.push(statusBarItem);

  /**  監聽 tab 變化 (同一分割視窗內切換分頁) */
  const changeTabsListener = vscode.window.tabGroups.onDidChangeTabs(() => {
    updateFromActiveTab(statusBarItem);
  });
  /**  監聽 tab group 變化 (不同分割視窗間切換) */
  const changeTabGroupsListener = vscode.window.tabGroups.onDidChangeTabGroups(() => {
    updateFromActiveTab(statusBarItem);
  });

  context.subscriptions.push(changeTabsListener, changeTabGroupsListener);

  // 初始更新
  updateFromActiveTab(statusBarItem);
}
