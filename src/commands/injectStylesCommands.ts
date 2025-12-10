import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import customStyle from "@/assets/customStyle.css";
import { parse as parseHtml } from "node-html-parser";
import { createCommandManager, getConfig } from "@/utils/command";

/**
 * 定位 VSCode 的 workbench HTML 檔案路徑
 */
function locateHtml() {
  const resourceDir = getConfig("1ureka.vscodeResourcePath");
  if (!resourceDir) {
    vscode.window.showInformationMessage("請先在設定中指定 VSCode 資源目錄路徑，以啟用自訂樣式功能。");
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
 * 修改 Content-Security-Policy，允許載入外部資源（字體、樣式等）
 */
function allowExternalSources(htmlContent: string): string | null {
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
 * 注入自訂樣式
 */
function injectCustomStyles(htmlContent: string): string | null {
  const document = parseHtml(htmlContent);

  const head = document.querySelector("head");
  if (!head) return null;

  const existingLink = document.querySelector(`style[data-injected-by="1ureka"]`);
  if (existingLink) return null;

  head.insertAdjacentHTML("beforeend", `<style data-injected-by="1ureka">${customStyle}</style>`);
  return document.toString();
}

/**
 * 先使用 allowExternalSources 修改 CSP，然後注入自訂樣式
 */
async function injectStyles() {
  const htmlPath = locateHtml();
  if (!htmlPath) return;

  const htmlContent = fs.readFileSync(htmlPath, "utf-8");
  const modifiedCSPContent = allowExternalSources(htmlContent);
  if (!modifiedCSPContent) {
    vscode.window.showInformationMessage("自訂樣式已經注入過了，無需重複注入。");
    return;
  }

  const modifiedContent = injectCustomStyles(modifiedCSPContent);
  if (!modifiedContent) {
    vscode.window.showInformationMessage("自訂樣式已經注入過了，無需重複注入。");
    return;
  }

  fs.writeFileSync(htmlPath + ".bak", htmlContent, "utf-8"); // 備份原始檔案
  fs.writeFileSync(htmlPath, modifiedContent, "utf-8");

  const result = await vscode.window.showWarningMessage(
    "已成功注入自訂樣式，請重新啟動 VSCode 以套用變更。",
    "重新啟動"
  );

  if (result === "重新啟動") {
    vscode.commands.executeCommand("workbench.action.reloadWindow");
  }
}

/**
 * 還原備份的 workbench HTML 檔案
 */
async function restoreStyles() {
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

/**
 * 還原並重新注入樣式
 */
async function restoreAndReinjectStyles() {
  const htmlPath = locateHtml();
  if (!htmlPath) return;

  const backupPath = htmlPath + ".bak";
  if (!fs.existsSync(backupPath)) {
    vscode.window.showErrorMessage("找不到備份檔案，無法還原。請先執行注入樣式命令。");
    return;
  }

  try {
    // 還原備份
    const backupContent = fs.readFileSync(backupPath, "utf-8");
    fs.writeFileSync(htmlPath, backupContent, "utf-8");

    // 重新注入
    const htmlContent = fs.readFileSync(htmlPath, "utf-8");
    const modifiedCSPContent = allowExternalSources(htmlContent);
    if (!modifiedCSPContent) {
      vscode.window.showErrorMessage("無法修改 CSP，重新注入失敗。");
      return;
    }

    const modifiedContent = injectCustomStyles(modifiedCSPContent);
    if (!modifiedContent) {
      vscode.window.showErrorMessage("無法注入自訂樣式，重新注入失敗。");
      return;
    }

    fs.writeFileSync(htmlPath, modifiedContent, "utf-8");

    const result = await vscode.window.showWarningMessage(
      "已成功還原並重新注入自訂樣式，請重新啟動 VSCode 以套用變更。",
      "重新啟動"
    );

    if (result === "重新啟動") {
      vscode.commands.executeCommand("workbench.action.reloadWindow");
    }
  } catch (error) {
    vscode.window.showErrorMessage(`還原並重新注入失敗: ${error}`);
  }
}

export function registerInjectStylesCommands(context: vscode.ExtensionContext) {
  const commandManager = createCommandManager(context);
  commandManager.register("1ureka.injectStyles", injectStyles);
  commandManager.register("1ureka.restoreStyles", restoreStyles);
  commandManager.register("1ureka.restoreAndReinjectStyles", restoreAndReinjectStyles);
}
