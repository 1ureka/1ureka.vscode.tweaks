import * as vscode from "vscode";
import * as fs from "fs";
import { formatDateCompact, formatDateFull } from "../utils/dateFormatter";

export class FileTimestampProvider {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  }

  public register(context: vscode.ExtensionContext) {
    // 監聽編輯器切換
    context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        this.updateStatusBar(editor);
      })
    );

    // 初始化顯示
    this.updateStatusBar(vscode.window.activeTextEditor);

    context.subscriptions.push(this.statusBarItem);
  }

  private updateStatusBar(editor: vscode.TextEditor | undefined) {
    if (!editor || !editor.document.uri.fsPath) {
      this.statusBarItem.hide();
      return;
    }

    const filePath = editor.document.uri.fsPath;

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
