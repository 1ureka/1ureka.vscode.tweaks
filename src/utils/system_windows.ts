import iconv from "iconv-lite";
import fs from "fs-extra";
import { spawn } from "child_process";

// -------------------------------------------------------------------------------------------

/** 執行 PowerShell 指令並回傳 stdout（字串），假設 windows 系統是繁體中文環境 (使用 big5 編碼輸出) */
function runPowerShell(command: string, stdinData?: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const args = ["-NoProfile", "-Command", command];
    const ps = spawn("powershell.exe", args, { windowsHide: true });

    if (stdinData) {
      ps.stdin.write(stdinData);
      ps.stdin.end();
    }

    let stdout = "";
    let stderr = "";

    ps.stdout.on("data", (data) => {
      stdout += iconv.decode(data, "big5");
    });

    ps.stderr.on("data", (data) => {
      stderr += iconv.decode(data, "big5");
    });

    ps.on("exit", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`PowerShell exited with code ${code}. Stderr: ${stderr.trim()}`));
    });

    ps.on("error", (err) => {
      reject(err);
    });
  });
}

// -------------------------------------------------------------------------------------------

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
async function copyImageBinaryToSystem(base64: string) {
  return runPowerShell(copyImagePowerShellScript, base64);
}

const listSpecialFoldersScript = `
$shell = New-Object -ComObject Shell.Application
# 0x11 = "My Computer" / "This PC"
$root = $shell.Namespace(0x11)
$result = @()

foreach ($item in $root.Items()) {
    $path = $item.Path
    if ([string]::IsNullOrWhiteSpace($path)) { continue }
    $obj = [PSCustomObject]@{
        Name = $item.Name
        Path = $path
    }
    $result += $obj
}

$result | ConvertTo-Json -Depth 3
`;

/** 列出 Windows 特殊資料夾 */
async function listSpecialFolders() {
  const stdout = await runPowerShell(listSpecialFoldersScript);
  return JSON.parse(stdout);
}

/** Windows 檔案的屬性狀態，只針對對使用者有意義的回傳描述，比如 A 就不需要，因為無意義 */
const fileStatusDescription = {
  O: "離線 (僅線上)",
  P: "永遠保留在本機",
  R: "唯讀",
  H: "隱藏檔案",
  S: "系統檔案",
};

type FileStatusDescription = typeof fileStatusDescription;
type FileStatus = {
  code: string;
  description: FileStatusDescription[keyof FileStatusDescription] | null;
}[];

/** 透過 attrib 指令判斷檔案屬性 */
async function getFileStatus(filePath: string): Promise<FileStatus | null> {
  if (process.platform !== "win32") {
    return null;
  }

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    // attrib 輸出範例:
    // "A      O             C:\Users\...\OneDrive\Documents\example.txt"
    // "A                    C:\Users\...\Documents\example.txt"

    const cmd = `attrib "${filePath}"`;
    const stdout = await runPowerShell(cmd);
    const output = stdout.trim();

    // 屬性字母出現在最前方 (或接續空白)
    const match = output.match(/^((?:[A-Z])(?!:)\s*)+/);
    if (!match) return null;

    const attributes = match[0].replace(/\s+/g, "").split("");
    const status: FileStatus = attributes.map((attr) => {
      if (attr in fileStatusDescription) {
        return { code: attr, description: fileStatusDescription[attr as keyof FileStatusDescription] };
      } else {
        return { code: attr, description: null };
      }
    });

    return status;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return null;
  }
}

export { copyImageBinaryToSystem, getFileStatus, listSpecialFolders };
export type { FileStatus as WindowsFileStatus };
