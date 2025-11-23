import * as vscode from "vscode";
import * as path from "path";
import { exec, spawn } from "child_process";
import { generateBase64 } from "./imageOpener";

// 之所以有些沒有印出 error.message，是因為 Windows 命令提示字元預設使用的是 CP950 (Big5) 或 CP936 (GBK) 編碼，但是 Node.js 原生沒有支援這些編碼，只有 utf-8。, utf-16le 等。

/** 使用系統預設應用打開指定檔案 */
function openWithDefaultApp(filePath: string) {
  // 使用 start "" 讓 Windows 用預設應用程式開啟檔案
  exec(`start "" "${filePath}"`, (error) => {
    if (error) vscode.window.showErrorMessage("無法開啟檔案，請確認檔案存在且有對應的應用程式");
  });
}

/** 啟動指定應用程式 */
function openApplication(appName: string, appPath: string) {
  // 第一個字母大寫其餘小寫
  const displayName = appName.charAt(0).toUpperCase() + appName.slice(1).toLowerCase();

  // 直接啟動應用程式(不帶檔案)
  exec(`"${appPath}"`, (error) => {
    if (error) vscode.window.showErrorMessage(`無法啟動 ${displayName}，請確認是否有安裝該應用程式與有足夠的權限`);
  });
}

const setEnglishPrefix = `
[System.Threading.Thread]::CurrentThread.CurrentUICulture = 'en-US'
[System.Threading.Thread]::CurrentThread.CurrentCulture = 'en-US'\n
`;

/** 執行 PowerShell 指令，並強制使用英文環境避免亂碼 (原因該檔案的開頭 "之所以有些..." 有提及) */
function runPowerShell(command: string, stdinData?: string) {
  return new Promise<void>((resolve, reject) => {
    const args = ["-NoProfile", "-Command", setEnglishPrefix + command];
    const ps = spawn("powershell.exe", args, { windowsHide: true });

    if (stdinData) {
      ps.stdin.write(stdinData);
      ps.stdin.end();
    }

    let stderr = "";
    ps.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    ps.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`PowerShell exited with code ${code}. Stderr: ${stderr.trim()}`));
    });
    ps.on("error", (err) => {
      reject(err);
    });
  });
}

const copyImagePowerShellScript = `
Add-Type -AssemblyName System.Convert
Add-Type -AssemblyName System.IO.MemoryStream
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$base64 = [Console]::In.ReadToEnd()
$bytes = [System.Convert]::FromBase64String($base64)
$ms = New-Object System.IO.MemoryStream($bytes, 0, $bytes.Length)
$img = [System.Drawing.Image]::FromStream($ms)
[System.Windows.Forms.Clipboard]::SetImage($img)
$img.Dispose()
$ms.Dispose()
`;

/** 將圖片複製到剪貼簿，可以直接貼在比如瀏覽器的 google keep, chatGPT 或是 Word 等 */
async function copyImage(filePath: string) {
  const base64 = await generateBase64(filePath, "png");
  if (!base64) throw new Error("file is not an image");
  return runPowerShell(copyImagePowerShellScript, base64);
}

/** 將檔案路徑複製到剪貼簿，可以直接貼到 Explore檔案總管 或是 VsCode檔案總管等 */
function copyFile(filePath: string) {
  const powerShellScript = `Set-Clipboard -Path "${path.resolve(filePath)}"`;
  return runPowerShell(powerShellScript);
}

export { openWithDefaultApp, openApplication, copyImage, copyFile };
