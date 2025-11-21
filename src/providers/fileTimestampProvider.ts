import * as vscode from "vscode";
import * as fs from "fs";
import { formatDateCompact, formatDateFull } from "../utils/dateFormatter";

export class FileTimestampProvider implements vscode.CustomReadonlyEditorProvider {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  }

  public register(context: vscode.ExtensionContext) {
    // 註冊 catch-all CustomReadonlyEditorProvider (優先級最低)
    // 確保所有檔案類型都能被追蹤 (文字檔、圖片、PDF、二進位檔等)
    context.subscriptions.push(
      vscode.window.registerCustomEditorProvider("fileTimestamp.catchAll", this, {
        webviewOptions: {
          retainContextWhenHidden: false,
        },
        supportsMultipleEditorsPerDocument: true,
      })
    );

    // 監聽 tab 變化
    // 涵蓋: 點擊切換 tab、開啟新檔案、關閉檔案、重新排序 tab、
    //      在同一 editor group 內的所有 tab 操作
    context.subscriptions.push(
      vscode.window.tabGroups.onDidChangeTabs(() => {
        this.updateFromActiveTab();
      })
    );

    // 監聽 tab group 變化
    // 涵蓋: Split Editor (分割編輯器)、移動 tab 到其他 group、
    //      關閉 editor group、合併 editor group、
    //      在不同 editor group 之間切換焦點
    context.subscriptions.push(
      vscode.window.tabGroups.onDidChangeTabGroups(() => {
        this.updateFromActiveTab();
      })
    );

    // 初始化顯示
    this.updateFromActiveTab();

    context.subscriptions.push(this.statusBarItem);
  }

  private updateFromActiveTab() {
    const activeTab = vscode.window.tabGroups.activeTabGroup?.activeTab;

    if (!activeTab) {
      this.statusBarItem.hide();
      return;
    }

    // 嘗試從 tab input 取得 URI
    const input = activeTab.input;

    if (input && typeof input === "object") {
      // TabInputText, TabInputCustom 等都有 uri 屬性
      if ("uri" in input && input.uri instanceof vscode.Uri) {
        this.updateStatusBarFromUri(input.uri);
        return;
      }
    }

    // 如果無法從 input 取得,嘗試從 activeTextEditor
    if (vscode.window.activeTextEditor) {
      this.updateStatusBarFromUri(vscode.window.activeTextEditor.document.uri);
    } else {
      this.statusBarItem.hide();
    }
  }

  // CustomReadonlyEditorProvider 實作
  async openCustomDocument(
    uri: vscode.Uri,
    _openContext: vscode.CustomDocumentOpenContext,
    _token: vscode.CancellationToken
  ): Promise<vscode.CustomDocument> {
    // 當檔案被開啟時更新狀態列
    this.updateStatusBarFromUri(uri);
    return { uri, dispose: () => {} };
  }

  async resolveCustomEditor(
    _document: vscode.CustomDocument,
    _webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    // 不做任何事,讓 VS Code 使用預設的編輯器
    // 這只是為了觸發 openCustomDocument
  }

  private updateStatusBarFromUri(uri: vscode.Uri | undefined) {
    if (!uri || uri.scheme !== "file") {
      this.statusBarItem.hide();
      return;
    }

    const filePath = uri.fsPath;

    try {
      const stats = fs.statSync(filePath);
      const createdDate = stats.birthtime;
      const modifiedDate = stats.mtime;

      const createdCompact = formatDateCompact(createdDate);
      const modifiedCompact = formatDateCompact(modifiedDate);

      const createdFull = formatDateFull(createdDate);
      const modifiedFull = formatDateFull(modifiedDate);

      this.statusBarItem.text = `$(history) ${createdCompact} | $(pencil) ${modifiedCompact}`;
      this.statusBarItem.tooltip = `建立時間: ${createdFull}\n修改時間: ${modifiedFull}`;
      this.statusBarItem.show();
    } catch (error) {
      this.statusBarItem.hide();
    }
  }
}
