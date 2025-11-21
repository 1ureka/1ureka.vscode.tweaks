import * as vscode from "vscode";

export class FileTimestampEditorProvider implements vscode.CustomReadonlyEditorProvider {
  constructor(private onOpenDocument: (uri: vscode.Uri) => void) {}

  async openCustomDocument(
    uri: vscode.Uri,
    _openContext: vscode.CustomDocumentOpenContext,
    _token: vscode.CancellationToken
  ): Promise<vscode.CustomDocument> {
    // 當檔案被開啟時更新狀態列
    this.onOpenDocument(uri);
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
}
