import * as vscode from "vscode";

export class ImageViewerEditorProvider implements vscode.CustomReadonlyEditorProvider {
  constructor(
    private readonly resolveEditor: (document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) => void
  ) {}

  async openCustomDocument(
    uri: vscode.Uri,
    _openContext: vscode.CustomDocumentOpenContext,
    _token: vscode.CancellationToken
  ): Promise<vscode.CustomDocument> {
    return { uri, dispose: () => {} };
  }

  async resolveCustomEditor(
    document: vscode.CustomDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    this.resolveEditor(document, webviewPanel);
  }
}
