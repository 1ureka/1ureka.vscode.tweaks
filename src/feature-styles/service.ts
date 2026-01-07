import fs from "fs-extra";
import { getBackupPath, locateWorkbenchHtml, modifyWorkbenchHtml } from "@/feature-styles/patcher";

/**
 * 注入自訂樣式
 */
function injectStyles() {
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

  fs.writeFileSync(backupPath, htmlContent, "utf-8"); // 備份原始檔案
  fs.writeFileSync(htmlPath, modifiedContent, "utf-8");

  return { success: true, message: "自訂樣式注入成功。" };
}

/**
 * 還原備份的 workbench HTML 檔案
 */
function restoreStyles() {
  const { success, message } = locateWorkbenchHtml();
  if (!success) return { success: false, message };

  const htmlPath = message;

  const backupPath = getBackupPath(htmlPath);
  if (!fs.existsSync(backupPath)) {
    return { success: false, message: "找不到備份檔案，無法還原。" };
  }

  try {
    const backupContent = fs.readFileSync(backupPath, "utf-8");
    fs.writeFileSync(htmlPath, backupContent, "utf-8");
    fs.unlinkSync(backupPath); // 刪除備份檔案

    return { success: true, message: "還原 workbench HTML 成功。" };
  } catch (error) {
    return { success: false, message: `還原 workbench HTML 失敗: ${error}` };
  }
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
