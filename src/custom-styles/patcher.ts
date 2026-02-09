import fs from "fs-extra";
import * as path from "path";
import customStyle from "@/assets/customStyle.css";
import { parse as parseHtml } from "node-html-parser";
import { getConfig } from "@/vscode/config";

/**
 * 定位 VSCode 的 workbench HTML 檔案路徑，成功時回傳找到的路徑
 */
function locateWorkbenchHtml() {
  const resourceDir = getConfig("1ureka.vscodeResourcePath");
  if (!resourceDir) {
    return { success: false, message: "請先在設定中指定 VSCode 資源目錄路徑，以啟用自訂樣式功能。" };
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
      if (fs.existsSync(htmlPath)) return { success: true, message: htmlPath };
    }
  }

  return { success: false, message: "無法找到 VSCode 的 workbench 目錄，請確認所設定的資源目錄路徑是否正確。" };
}

/**
 * 修改 Content-Security-Policy，允許載入外部資源（字體、樣式等），成功時回傳修改後的 HTML 內容
 */
function allowExternalSources(htmlContent: string) {
  const document = parseHtml(htmlContent);
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!cspMeta) return { success: false, message: "找不到 Content-Security-Policy meta 標籤。" };

  let content = cspMeta.getAttribute("content") || "";

  const isModified = content.includes("https://fonts.googleapis.com") || content.includes("https://fonts.gstatic.com");
  if (isModified) return { success: false, message: "Content-Security-Policy 已經被修改過。" };

  content = content.replace(/style-src([^;]*);/, (_match, group1) => {
    return `style-src${group1} https://fonts.googleapis.com;`;
  });

  content = content.replace(/font-src([^;]*);/, (_match, group1) => {
    return `font-src${group1} https://fonts.gstatic.com;`;
  });

  cspMeta.setAttribute("content", content);
  return { success: true, message: document.toString() };
}

/**
 * 修改 VSCode 的 workbench HTML，成功時回傳修改後的 HTML 內容
 */
function modifyWorkbenchHtml(htmlContent: string) {
  const { success, message } = allowExternalSources(htmlContent);
  if (!success) {
    return { success: false, message };
  }

  const document = parseHtml(message);

  const head = document.querySelector("head");
  if (!head) {
    return { success: false, message: "找不到 head 標籤。" };
  }

  const existingLink = document.querySelector(`style[data-injected-by="1ureka"]`);
  if (existingLink) {
    return { success: false, message: "已經存在相同 data-injected-by 樣式標籤。" };
  }

  head.insertAdjacentHTML("beforeend", `<style data-injected-by="1ureka">${customStyle}</style>`);

  return { success: true, message: document.toString() };
}

/**
 * 取得備份檔案路徑
 */
function getBackupPath(htmlPath: string) {
  return htmlPath + ".bak";
}

export { locateWorkbenchHtml, modifyWorkbenchHtml, getBackupPath };
