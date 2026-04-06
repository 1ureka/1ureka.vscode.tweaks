/**
 * 產生攔截用 Webview 的 HTML 內容
 */
function renderWebviewHtml(fileName: string, svgContent: string) {
  return /* html */ `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      background-color: var(--vscode-editor-background);
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      user-select: none;
    }

    .icon {
      width: 64px;
      height: 64px;
      opacity: 0.6;
    }

    .icon svg {
      width: 100%;
      height: 100%;
      fill: var(--vscode-foreground);
    }

    .file-name {
      font-size: 1.1em;
      opacity: 0.8;
      word-break: break-all;
      text-align: center;
      max-width: 400px;
    }

    button {
      margin-top: 8px;
      padding: 8px 20px;
      border: 1px solid transparent;
      border-radius: 2px;
      cursor: pointer;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-button-foreground);
      background-color: var(--vscode-button-background);
    }

    button:hover {
      background-color: var(--vscode-button-hoverBackground);
    }

    button:focus-visible {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: 2px;
    }
  </style>
</head>
<body>
  <div class="icon">${svgContent}</div>
  <div class="file-name">${escapeHtml(fileName)}</div>
  <button id="open">以預設應用程式開啟</button>
  <script>
    const vscode = acquireVsCodeApi();
    document.getElementById("open").addEventListener("click", () => {
      vscode.postMessage({ type: "open" });
    });
  </script>
</body>
</html>`;
}

/**
 * 跳脫 HTML 特殊字元
 */
function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export { renderWebviewHtml };
