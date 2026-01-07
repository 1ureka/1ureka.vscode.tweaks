import * as vscode from "vscode";
import { getMetadata } from "@/feature-metadata/metadata";
import { renderFileMetadata, renderImageMetadata } from "@/feature-metadata/renderer";

/**
 * ?
 */
export const createStatusBarManager = (context: vscode.ExtensionContext) => {
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  context.subscriptions.push(statusBarItem);

  /**
   * 根據給定的 URI 更新狀態列顯示
   */
  async function updateStatusBarFromUri(uri: vscode.Uri | undefined) {
    if (!uri || uri.scheme !== "file") {
      statusBarItem.hide();
      return;
    }

    const info = await getMetadata(uri.fsPath);
    if (!info) {
      statusBarItem.hide();
      return;
    }

    if ("width" in info && "height" in info) renderImageMetadata(statusBarItem, info);
    else renderFileMetadata(statusBarItem, info);
  }

  /**
   * 從目前活動的分頁更新狀態列顯示
   */
  async function updateFromActiveTab() {
    const activeTab = vscode.window.tabGroups.activeTabGroup?.activeTab;
    if (!activeTab) {
      statusBarItem.hide();
      return;
    }

    // 根據實測，不管是可以打開的 *.js, *.ts，還是不可能打開的 *.blend, *.fbx，又或是處在中間的 *.png, *.jpg等
    // 也就是任何檔案類型的 Tab input 都必定包含 uri 屬性
    // 而像是 Thunder client 頁面, 歡迎頁面等則沒有
    // 這剛好符合需求: 對任意檔案顯示其元資料，對非檔案則不顯示
    const input = activeTab.input;
    if (input && typeof input === "object") {
      if ("uri" in input && input.uri instanceof vscode.Uri) {
        await updateStatusBarFromUri(input.uri);
        return;
      }
    }

    statusBarItem.hide();
  }

  return { updateFromActiveTab };
};
