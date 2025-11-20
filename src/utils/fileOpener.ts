import * as vscode from "vscode";
import { exec } from "child_process";

// 之所以沒有印出 error.message，是因為 Windows 命令提示字元預設使用的是 CP950 (Big5) 或 CP936 (GBK) 編碼，但是 Node.js 原生沒有支援這些編碼，只有 utf-8。, utf-16le 等。

export function openWithDefaultApp(filePath: string) {
  // 使用 start "" 讓 Windows 用預設應用程式開啟檔案
  exec(`start "" "${filePath}"`, (error) => {
    if (error) vscode.window.showErrorMessage("無法開啟檔案，請確認檔案存在且有對應的應用程式");
  });
}

export function openApplication(appName: string, appPath: string) {
  // 第一個字母大寫其餘小寫
  const displayName = appName.charAt(0).toUpperCase() + appName.slice(1).toLowerCase();

  // 直接啟動應用程式(不帶檔案)
  exec(`"${appPath}"`, (error) => {
    if (error) vscode.window.showErrorMessage(`無法啟動 ${displayName}，請確認是否有安裝該應用程式與有足夠的權限`);
  });
}
