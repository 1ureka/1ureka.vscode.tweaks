import iconv from "iconv-lite";
import { spawn } from "child_process";

// --- 型別定義 (Types) -----------------------------------------------------------------------

/** 磁碟類型枚舉 */
export enum DriveType {
  Unknown = 0,
  NoRootDirectory = 1,
  RemovableDisk = 2, // 隨身碟
  LocalDisk = 3, // 硬碟/SSD
  NetworkDrive = 4, // 網路磁碟
  CompactDisk = 5, // CD/DVD
  RAMDisk = 6,
}

/** 系統資料夾資訊（包含實體硬碟入口與 OneDrive） */
export interface SystemFolder {
  Name: string;
  Path: string;
}

/** 磁碟詳細硬體資訊 */
export interface VolumeInfo {
  /** 磁碟代號，例如 "C:" */
  DeviceID: string;
  /** 磁碟名稱，例如 "Windows" 或 "Data" */
  VolumeName: string | null;
  /** 剩餘空間 (Bytes) */
  FreeSpace: number | null;
  /** 總容量 (Bytes) */
  Size: number | null;
  /** 檔案系統，例如 "NTFS", "FAT32" */
  FileSystem: string | null;
  /** 磁碟類型 */
  DriveType: DriveType;
}

// --- 核心邏輯 (Core) ------------------------------------------------------------------------

/** 執行 PowerShell 指令並回傳 stdout（字串），假設 windows 系統是繁體中文環境 (使用 big5 編碼輸出) */
function runPowerShell(command: string, stdinData?: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const inputEncodingSetup = `[Console]::InputEncoding = [System.Text.Encoding]::UTF8; `;
    const args = ["-NoProfile", "-NonInteractive", "-Command", `${inputEncodingSetup}${command}`];
    const ps = spawn("powershell.exe", args, { windowsHide: true });

    let stdout: Buffer[] = [];
    let stderr: Buffer[] = [];

    ps.stdout.on("data", (chunk) => stdout.push(chunk));
    ps.stderr.on("data", (data) => stderr.push(data));

    ps.on("close", (code) => {
      const stdoutStr = iconv.decode(Buffer.concat(stdout), "big5");
      const stderrStr = iconv.decode(Buffer.concat(stderr), "big5");

      if (code === 0) resolve(stdoutStr);
      else reject(new Error(`PowerShell exited with code ${code}. Stderr: ${stderrStr.trim()}`));
    });

    ps.on("error", (err) => {
      reject(err);
    });

    if (stdinData) {
      ps.stdin.end(stdinData, "utf-8");
    }
  });
}

// --- 腳本定義 (Scripts) ---------------------------------------------------------------------

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

const listSystemFoldersScript = `
$shell = New-Object -ComObject Shell.Application
$res = @()
$res += $shell.Namespace(0x11).Items() | Where-Object { $_.Path }
$res += $shell.Namespace(0x00).Items() | Where-Object { $_.Name -like "*OneDrive*" -and $_.Path -match '^[A-Z]:\\\\' }
@($res | ForEach-Object { [PSCustomObject]@{ Name = $_.Name; Path = $_.Path } }) | ConvertTo-Json
`;

const listVolumesScript = `
$data = Get-CimInstance Win32_LogicalDisk | ForEach-Object {
    [PSCustomObject]@{
        DeviceID = $_.DeviceID
        VolumeName = $_.VolumeName
        FreeSpace = [double]$_.FreeSpace
        Size = [double]$_.Size
        FileSystem = $_.FileSystem
        DriveType = [int]$_.DriveType
    }
}
@($data) | ConvertTo-Json
`;

// --- 導出的 API (Exported APIs) ------------------------------------------------------------

/** * 將圖片 Base64 字串複製到系統剪貼簿
 * @param base64 純 Base64 字串 (不含 data:image/... 前綴)
 */
export async function copyImageBinaryToSystem(base64: string): Promise<void> {
  await runPowerShell(copyImagePowerShellScript, base64);
}

/** 列出系統關鍵資料夾（包含本機硬碟與 OneDrive） */
export async function listSystemFolders(): Promise<SystemFolder[]> {
  const stdout = await runPowerShell(listSystemFoldersScript);
  if (!stdout || stdout.trim() === "") return [];
  const result = JSON.parse(stdout);
  return Array.isArray(result) ? result : [result];
}

/** 列出所有邏輯磁碟機的詳細硬體資訊（容量單位為 Bytes） */
export async function listVolumes(): Promise<VolumeInfo[]> {
  const stdout = await runPowerShell(listVolumesScript);
  if (!stdout || stdout.trim() === "") return [];
  const result = JSON.parse(stdout);
  return Array.isArray(result) ? result : [result];
}
