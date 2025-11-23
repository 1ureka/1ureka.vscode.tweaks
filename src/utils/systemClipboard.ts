import * as path from "path";
import { spawn } from "child_process";
import { generateBase64 } from "./imageOpener";

function runPowerShell(command: string, stdinData?: string) {
  const setEnglish = `
[System.Threading.Thread]::CurrentThread.CurrentUICulture = 'en-US'
[System.Threading.Thread]::CurrentThread.CurrentCulture = 'en-US'\n
    `;

  return new Promise<void>((resolve, reject) => {
    const ps = spawn("powershell.exe", ["-NoProfile", "-Command", setEnglish + command], { windowsHide: true });

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

/**
 * 將圖片複製到剪貼簿，可以直接貼在比如瀏覽器的 google keep, chatGPT 或是 Word 等 (Windows)
 */
async function copyImageWindows(filePath: string) {
  const base64 = await generateBase64(filePath, "png");
  if (!base64) throw new Error("file is not an image");

  const powerShellScript = `
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

  return runPowerShell(powerShellScript, base64);
}

/**
 * 將檔案路徑複製到剪貼簿，可以直接貼到 Explore檔案總管 或是 VsCode檔案總管等 (Windows)
 */
function copyFileWindows(filePath: string) {
  const powerShellScript = `Set-Clipboard -Path "${path.resolve(filePath)}"`;
  return runPowerShell(powerShellScript);
}

export { copyImageWindows, copyFileWindows };
