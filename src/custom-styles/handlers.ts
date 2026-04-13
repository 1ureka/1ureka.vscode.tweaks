import fs from "fs-extra";
import { getBackupPath } from "@/custom-styles/patcher";
import { locateWorkbenchHtml, modifyWorkbenchHtml } from "@/custom-styles/patcher";
import { locateMarkdownCss, modifyMarkdownCss } from "@/custom-styles/patcher";

/**
 * 注入自訂樣式
 */
function injectStyles() {
  // --- Workbench HTML ---

  const { success: successLocate, message: locateHtmlMessage } = locateWorkbenchHtml();
  if (!successLocate) {
    return { success: false, message: locateHtmlMessage };
  }

  const htmlPath = locateHtmlMessage;
  const backupPath = getBackupPath(htmlPath);

  if (fs.existsSync(backupPath)) {
    return { success: false, message: "已經存在備份檔案，請先還原樣式後再進行注入。" };
  }

  const htmlContent = fs.readFileSync(htmlPath, "utf-8");

  const { success: successModify, message: modifyHtmlMessage } = modifyWorkbenchHtml(htmlContent);
  if (!successModify) {
    return { success: false, message: modifyHtmlMessage };
  }

  const modifiedContent = modifyHtmlMessage;

  // --- Markdown CSS ---

  const { success: successLocateMd, message: locateMdMessage } = locateMarkdownCss();
  if (!successLocateMd) {
    return { success: false, message: locateMdMessage };
  }

  const mdCssPath = locateMdMessage;
  const mdBackupPath = getBackupPath(mdCssPath);

  if (fs.existsSync(mdBackupPath)) {
    return { success: false, message: "markdown.css 已經存在備份檔案，請先還原樣式後再進行注入。" };
  }

  const mdCssContent = fs.readFileSync(mdCssPath, "utf-8");
  const { message: modifiedMarkdownCss } = modifyMarkdownCss();

  // ---

  fs.writeFileSync(backupPath, htmlContent, "utf-8");
  fs.writeFileSync(htmlPath, modifiedContent, "utf-8");
  fs.writeFileSync(mdBackupPath, mdCssContent, "utf-8");
  fs.writeFileSync(mdCssPath, modifiedMarkdownCss, "utf-8");

  return { success: true, message: "自訂樣式注入成功。" };
}

/**
 * 還原備份的 workbench HTML 及 markdown CSS 檔案
 */
function restoreStyles() {
  const locateHtml = locateWorkbenchHtml();
  if (!locateHtml.success) return { success: false, message: locateHtml.message };

  const htmlPath = locateHtml.message;
  const backupPath = getBackupPath(htmlPath);
  if (!fs.existsSync(backupPath)) {
    return { success: false, message: "找不到 workbench HTML 的備份檔案，無法還原。" };
  }

  try {
    const backupContent = fs.readFileSync(backupPath, "utf-8");
    fs.writeFileSync(htmlPath, backupContent, "utf-8");
    fs.unlinkSync(backupPath);
  } catch (error) {
    return { success: false, message: `還原樣式失敗: ${error}` };
  }

  const locateMd = locateMarkdownCss();
  if (!locateMd.success) return { success: false, message: locateMd.message };

  const mdCssPath = locateMd.message;
  const mdBackupPath = getBackupPath(mdCssPath);
  if (!fs.existsSync(mdBackupPath)) {
    return { success: true, message: `已還原 workbench HTML ，跳過無備份的 markdown.css 。` };
  }

  try {
    const mdBackupContent = fs.readFileSync(mdBackupPath, "utf-8");
    fs.writeFileSync(mdCssPath, mdBackupContent, "utf-8");
    fs.unlinkSync(mdBackupPath);
  } catch (error) {
    return { success: false, message: `還原樣式失敗: ${error}` };
  }

  return { success: true, message: "已還原 workbench HTML 及 markdown.css 。" };
}

/**
 * 還原並重新注入樣式
 */
function restoreAndReinjectStyles() {
  const { success: restoreSuccess, message: restoreMessage } = restoreStyles();
  if (!restoreSuccess) return { success: false, message: restoreMessage };

  const { success: injectSuccess, message: injectMessage } = injectStyles();
  if (!injectSuccess) return { success: false, message: injectMessage };

  return { success: true, message: "還原並重新注入樣式成功。" };
}

export { injectStyles, restoreStyles, restoreAndReinjectStyles };
