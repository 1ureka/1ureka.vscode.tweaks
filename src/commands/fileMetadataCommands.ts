import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { setImageStatusBar, setFileStatusBar } from "../providers/fileMetadataProvider";
import type { FileInfo } from "../providers/fileMetadataProvider";
import { openImage } from "../utils/imageOpener";

function createStatusBarItem(): vscode.StatusBarItem {
  return vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
}

async function updateStatusBarFromUri(statusBarItem: vscode.StatusBarItem, uri: vscode.Uri | undefined) {
  if (!uri || uri.scheme !== "file") {
    statusBarItem.hide();
    return;
  }

  const filePath = uri.fsPath;

  try {
    const stats = fs.statSync(filePath);
    const createdDate = stats.birthtime;
    const modifiedDate = stats.mtime;
    const fileSize = stats.size;
    const fileName = path.basename(path.resolve(filePath));

    const baseInfo: FileInfo = { fileName, createdDate, modifiedDate, fileSize };
    const imageMetadata = await openImage(filePath);

    if (imageMetadata) {
      const { width, height, format, space, channels, hasAlpha } = imageMetadata;
      setImageStatusBar(statusBarItem, { ...baseInfo, width, height, format, space, channels, hasAlpha });
    } else {
      setFileStatusBar(statusBarItem, baseInfo);
    }
  } catch (error) {
    statusBarItem.hide();
  }
}

async function updateFromActiveTab(statusBarItem: vscode.StatusBarItem) {
  const activeTab = vscode.window.tabGroups.activeTabGroup?.activeTab;

  if (!activeTab) {
    statusBarItem.hide();
    return;
  }

  // 嘗試從 tab input 取得 URI
  const input = activeTab.input;

  if (input && typeof input === "object") {
    // TabInputText, TabInputCustom 等都有 uri 屬性
    if ("uri" in input && input.uri instanceof vscode.Uri) {
      await updateStatusBarFromUri(statusBarItem, input.uri);
      return;
    }
  }

  // 如果無法從 input 取得,嘗試從 activeTextEditor
  if (vscode.window.activeTextEditor) {
    await updateStatusBarFromUri(statusBarItem, vscode.window.activeTextEditor.document.uri);
  } else {
    statusBarItem.hide();
  }
}

export function registerFileMetadataCommands(context: vscode.ExtensionContext) {
  const statusBarItem = createStatusBarItem();

  // 監聽 tab 變化 (同一分割視窗內切換分頁)
  context.subscriptions.push(
    vscode.window.tabGroups.onDidChangeTabs(() => {
      updateFromActiveTab(statusBarItem);
    })
  );

  // 監聽 tab group 變化 (不同分割視窗間切換)
  context.subscriptions.push(
    vscode.window.tabGroups.onDidChangeTabGroups(() => {
      updateFromActiveTab(statusBarItem);
    })
  );

  // 初始化顯示
  updateFromActiveTab(statusBarItem);

  context.subscriptions.push(statusBarItem);
}
