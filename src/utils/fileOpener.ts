import * as vscode from "vscode";
import { exec } from "child_process";

export function openWithDefaultApp(filePath: string) {
  try {
    // 使用 start "" 讓 Windows 用預設應用程式開啟檔案
    exec(`start "" "${filePath}"`, (error) => {
      if (error) {
        // 無法印出 error 因為會是亂碼，我已經嘗試 utf-8 與 utf-16，其他的，比如 big5 則不在 BufferEncoding 裡面，TS 不讓我這樣做
        vscode.window.showErrorMessage("無法開啟檔案");
      } else {
        vscode.window.showInformationMessage(`已開啟: ${filePath}`);
      }
    });
  } catch (error) {
    vscode.window.showErrorMessage(`無法開啟檔案: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function openApplication(appName: string, appPath: string) {
  // 第一個字母大寫其餘小寫
  const displayName = appName.charAt(0).toUpperCase() + appName.slice(1).toLowerCase();

  try {
    // 直接啟動應用程式(不帶檔案)
    exec(`start "" "${appPath}"`, (error) => {
      if (error) {
        vscode.window.showErrorMessage(`無法啟動 ${displayName}`);
      } else {
        vscode.window.showInformationMessage(`已啟動 ${displayName}`);
      }
    });
  } catch (error) {
    vscode.window.showErrorMessage(`無法啟動應用程式: ${error instanceof Error ? error.message : String(error)}`);
  }
}
