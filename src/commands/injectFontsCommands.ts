import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import customStyle from "../utils/customStyle.css";
import { parse as parseHtml } from "node-html-parser";

function getConfiguredPath(): string | undefined {
  const config = vscode.workspace.getConfiguration("1ureka");
  return config.get<string>("vscodeResourcePath");
}

/**
 * 定位 VSCode 的 workbench HTML 檔案路徑
 */
function locateHtml() {
  const resourceDir = getConfiguredPath();
  if (!resourceDir) {
    vscode.window.showInformationMessage("請先在設定中指定 VSCode 資源目錄路徑，以啟用字型注入功能。");
    return null;
  }

  const htmlBasePath = path.join(resourceDir, "code");
  const htmlDirCandidates = [
    // v1.102+ path
    path.join(htmlBasePath, "electron-browser", "workbench"),
    path.join(htmlBasePath, "electron-browser"),
  ];

  const htmlFileNameCandidates = [
    "workbench-dev.html", // VSCode dev
    "workbench.esm.html", // VSCode ESM
    "workbench.html", // VSCode
    "workbench-apc-extension.html", // Cursor
  ];

  for (const htmlDirCandidate of htmlDirCandidates) {
    for (const htmlFileNameCandidate of htmlFileNameCandidates) {
      const htmlPath = path.join(htmlDirCandidate, htmlFileNameCandidate);
      if (fs.existsSync(htmlPath)) return htmlPath;
    }
  }

  vscode.window.showInformationMessage("無法找到 VSCode 的 workbench 目錄，請確認所設定的資源目錄路徑是否正確。");
  return null;
}

/**
 * 修改 Content-Security-Policy，允許載入字體來源
 */
function allowFontsSources(htmlContent: string): string | null {
  const document = parseHtml(htmlContent);

  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!cspMeta) return null;

  let content = cspMeta.getAttribute("content") || "";
  if (content.includes("fonts.googleapis.com") && content.includes("cdn.jsdelivr.net")) return null;

  content = content.replace(/style-src([^;]*);/, (_match, group1) => {
    return `style-src${group1} https://fonts.googleapis.com;`;
  });

  content = content.replace(/font-src([^;]*);/, (_match, group1) => {
    return `font-src${group1} https://fonts.gstatic.com https://cdn.jsdelivr.net;`;
  });

  cspMeta.setAttribute("content", content);
  return document.toString();
}

/**
 * 注入自訂字型
 */
function injectFonts(htmlContent: string): string | null {
  const document = parseHtml(htmlContent);

  const head = document.querySelector("head");
  if (!head) return null;

  const existingLink = document.querySelector(`style[data-injected-by="1ureka"]`);
  if (existingLink) return null;

  head.insertAdjacentHTML("beforeend", `<style data-injected-by="1ureka">${customStyle}</style>`);
  return document.toString();
}

/**
 * 先使用 allowFontsSources 修改 CSP，然後注入字型
 */
async function injectCustomFonts() {
  const htmlPath = locateHtml();
  if (!htmlPath) return;

  const htmlContent = fs.readFileSync(htmlPath, "utf-8");
  const modifiedCSPContent = allowFontsSources(htmlContent);
  if (!modifiedCSPContent) {
    vscode.window.showInformationMessage("自訂字型已經注入過了，無需重複注入。");
    return;
  }

  const modifiedContent = injectFonts(modifiedCSPContent);
  if (!modifiedContent) {
    vscode.window.showInformationMessage("自訂字型已經注入過了，無需重複注入。");
    return;
  }

  fs.writeFileSync(htmlPath + ".bak", htmlContent, "utf-8"); // 備份原始檔案
  fs.writeFileSync(htmlPath, modifiedContent, "utf-8");

  const result = await vscode.window.showWarningMessage(
    "已成功注入自訂字型，請重新啟動 VSCode 以套用變更。",
    "重新啟動"
  );

  if (result === "重新啟動") {
    vscode.commands.executeCommand("workbench.action.reloadWindow");
  }
}

/**
 * 還原備份的 workbench HTML 檔案
 */
async function restoreFonts() {
  const htmlPath = locateHtml();
  if (!htmlPath) return;

  const backupPath = htmlPath + ".bak";
  if (!fs.existsSync(backupPath)) {
    vscode.window.showErrorMessage("找不到備份檔案，無法還原。");
    return;
  }

  try {
    const backupContent = fs.readFileSync(backupPath, "utf-8");
    fs.writeFileSync(htmlPath, backupContent, "utf-8");
    fs.unlinkSync(backupPath); // 刪除備份檔案

    const result = await vscode.window.showWarningMessage(
      "已成功還原至原始狀態，請重新啟動 VSCode 以套用變更。",
      "重新啟動"
    );

    if (result === "重新啟動") {
      vscode.commands.executeCommand("workbench.action.reloadWindow");
    }
  } catch (error) {
    vscode.window.showErrorMessage(`還原失敗: ${error}`);
  }
}

export function registerInjectFontsCommands(context: vscode.ExtensionContext) {
  const injectFontsCommand = vscode.commands.registerCommand("extension.injectFonts", injectCustomFonts);
  const restoreFontsCommand = vscode.commands.registerCommand("extension.restoreFonts", restoreFonts);

  context.subscriptions.push(injectFontsCommand, restoreFontsCommand);
}
