import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { formatDateCompact, formatDateFull } from "../utils/dateFormatter";
import { FileTimestampEditorProvider } from "../providers/fileTimestampProvider";

function createStatusBarItem(): vscode.StatusBarItem {
  return vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
}

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  else if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  else if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  else return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function updateStatusBarFromUri(statusBarItem: vscode.StatusBarItem, uri: vscode.Uri | undefined) {
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

    const createdCompact = formatDateCompact(createdDate);
    const modifiedCompact = formatDateCompact(modifiedDate);

    const createdFull = formatDateFull(createdDate);
    const modifiedFull = formatDateFull(modifiedDate);
    const formattedFileSize = formatFileSize(fileSize);

    statusBarItem.name = "檔案屬性";
    statusBarItem.text = `$(history) ${createdCompact} | $(pencil) ${modifiedCompact}`;
    const paddingSymbol = "&nbsp;".repeat(2);
    statusBarItem.tooltip = new vscode.MarkdownString(
      `### \`${fileName}\`\n\n- **建立時間:** ${createdFull}${paddingSymbol}\n\n- **修改時間:** ${modifiedFull}` +
        `\n\n- **檔案大小:** ${formattedFileSize}`
    );

    statusBarItem.show();
  } catch (error) {
    statusBarItem.hide();
  }
}

function updateFromActiveTab(statusBarItem: vscode.StatusBarItem) {
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
      updateStatusBarFromUri(statusBarItem, input.uri);
      return;
    }
  }

  // 如果無法從 input 取得,嘗試從 activeTextEditor
  if (vscode.window.activeTextEditor) {
    updateStatusBarFromUri(statusBarItem, vscode.window.activeTextEditor.document.uri);
  } else {
    statusBarItem.hide();
  }
}

export function registerFileTimestampCommands(context: vscode.ExtensionContext) {
  const statusBarItem = createStatusBarItem();

  // 建立 provider，並傳入更新狀態列的回調
  const provider = new FileTimestampEditorProvider((uri) => {
    updateStatusBarFromUri(statusBarItem, uri);
  });

  // 註冊 catch-all CustomReadonlyEditorProvider (優先級最低)
  // 確保所有檔案類型都能被追蹤 (文字檔、圖片、PDF、二進位檔等)
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider("fileTimestamp.catchAll", provider, {
      webviewOptions: { retainContextWhenHidden: false },
      supportsMultipleEditorsPerDocument: true,
    })
  );

  // 監聽 tab 變化
  // 涵蓋: 點擊切換 tab、開啟新檔案、關閉檔案、重新排序 tab、
  //      在同一 editor group 內的所有 tab 操作
  context.subscriptions.push(
    vscode.window.tabGroups.onDidChangeTabs(() => {
      updateFromActiveTab(statusBarItem);
    })
  );

  // 監聽 tab group 變化
  // 涵蓋: Split Editor (分割編輯器)、移動 tab 到其他 group、
  //      關閉 editor group、合併 editor group、
  //      在不同 editor group 之間切換焦點
  context.subscriptions.push(
    vscode.window.tabGroups.onDidChangeTabGroups(() => {
      updateFromActiveTab(statusBarItem);
    })
  );

  // 初始化顯示
  updateFromActiveTab(statusBarItem);

  context.subscriptions.push(statusBarItem);
}
