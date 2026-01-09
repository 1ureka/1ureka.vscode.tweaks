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

/** 根據 [System.IO.FileAttributes] 官方枚舉定義的型別 */
export type FileAttribute =
  | "ReadOnly"
  | "Hidden"
  | "System"
  | "Directory"
  | "Archive"
  | "Device"
  | "Normal"
  | "Temporary"
  | "SparseFile"
  | "ReparsePoint"
  | "Compressed"
  | "Offline"
  | "NotContentIndexed"
  | "Encrypted"
  | "IntegrityStream"
  | "NoScrubData";

/** 檔案可用性狀態 */
export type FileAvailability = "Normal" | "OnlineOnly" | "AlwaysAvailable" | "LocallyAvailable";

/** 資料夾統計資訊 */
export interface DirectorySizeInfo {
  Path: string;
  FileCount: number;
  TotalSize: number; // Bytes
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
$res += $shell.Namespace(0x00).Items() | Where-Object { $_.Name -like "*OneDrive*" -and $_.Path -match '^[A-Z]:\\\\' }
$res += $shell.Namespace(0x11).Items() | Where-Object { $_.Path }
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

const getFileAttrScript = `
$path = [Console]::In.ReadLine()
try {
    if (Test-Path -LiteralPath $path -PathType Leaf) {
        $attr = [System.IO.File]::GetAttributes($path)

        # 取得所有標準枚舉名稱
        $standardNames = [System.Enum]::GetNames([System.IO.FileAttributes])
        $result = @()

        # 逐一檢查該檔案是否具備這些標準屬性
        foreach ($name in $standardNames) {
            $enumVal = [System.IO.FileAttributes]::$name
            if (($attr.value__ -band $enumVal.value__) -eq $enumVal.value__) {
                $result += $name
            }
        }

        $result | ConvertTo-Json
    } else { "null" }
} catch { "null" }
`;

const getFileAvailabilityScript = `
$path = [Console]::In.ReadLine()
try {
    if (Test-Path -LiteralPath $path -PathType Leaf) {
        $item = Get-Item -LiteralPath $path
        $attr = [int]$item.Attributes

        # Windows API File Attribute Constants
        $RECALL_ON_DATA_ACCESS = 0x00400000
        $PINNED                = 0x00080000
        $UNPINNED              = 0x00100000
        $REPARSE_POINT         = 0x00000400

        if ($attr -band $RECALL_ON_DATA_ACCESS) {
            "OnlineOnly"
        } elseif ($attr -band $PINNED) {
            "AlwaysAvailable"
        } elseif ($attr -band $UNPINNED) {
            "LocallyAvailable"
        } elseif ($attr -band $REPARSE_POINT) {
            "LocallyAvailable"
        } else {
            "Normal"
        }
    } else { "null" }
} catch { "null" }
`;

const getFolderSizeScript = `
$path = [Console]::In.ReadLine()
try {
    if (Test-Path -LiteralPath $path -PathType Container) {
        $dirInfo = New-Object System.IO.DirectoryInfo($path)
        $files = $dirInfo.EnumerateFiles("*", [System.IO.SearchOption]::AllDirectories)

        $count = 0
        $size = 0
        foreach ($f in $files) {
            $count++
            $size += $f.Length
        }

        [PSCustomObject]@{
            Path = $path
            FileCount = $count
            TotalSize = $size
        } | ConvertTo-Json
    } else { "null" }
} catch { "null" }
`;

// --- 導出的 API (Exported APIs) ------------------------------------------------------------

/**
 * 將圖片 Base64 字串複製到系統剪貼簿
 * @param base64 純 Base64 字串 (不含 data:image/... 前綴)
 */
export async function copyImageBinaryToSystem(base64: string): Promise<void> {
  await runPowerShell(copyImagePowerShellScript, base64);
}

/**
 * 列出系統關鍵資料夾（包含本機硬碟與 OneDrive）
 */
export async function listSystemFolders(): Promise<SystemFolder[]> {
  const stdout = await runPowerShell(listSystemFoldersScript);
  if (!stdout || stdout.trim() === "") return [];
  const result = JSON.parse(stdout);
  return Array.isArray(result) ? result : [result];
}

/**
 * 列出所有邏輯磁碟機的詳細硬體資訊（容量單位為 Bytes）
 */
export async function listVolumes(): Promise<VolumeInfo[]> {
  const stdout = await runPowerShell(listVolumesScript);
  if (!stdout || stdout.trim() === "") return [];
  const result = JSON.parse(stdout);
  return Array.isArray(result) ? result : [result];
}

/**
 * 取得檔案的 Windows 屬性
 * @param filePath 檔案的完整路徑
 * @returns 如果是檔案則回傳屬性陣列，若路徑無效或為資料夾則回傳 null
 */
export async function getFileAttributes(filePath: string): Promise<FileAttribute[] | null> {
  const stdout = await runPowerShell(getFileAttrScript, filePath);
  const trimmed = stdout.trim();
  if (!trimmed || trimmed === "null") return null;
  const result = JSON.parse(trimmed);
  return Array.isArray(result) ? result : [result];
}

/**
 * 取得檔案的可用性狀態
 * @param filePath 檔案的完整路徑
 * @returns `Normal`、`OnlineOnly`、`AlwaysAvailable`、`LocallyAvailable` 或 `Unknown`
 */
export async function getFileAvailability(filePath: string): Promise<FileAvailability | null> {
  const stdout = await runPowerShell(getFileAvailabilityScript, filePath);
  const trimmed = stdout.trim();
  if (!trimmed) return null;
  if (["Normal", "OnlineOnly", "AlwaysAvailable", "LocallyAvailable"].includes(trimmed)) {
    return trimmed as FileAvailability;
  } else {
    return null;
  }
}

/**
 * 取得資料夾的總檔案數與總大小（包含子目錄）
 * @param folderPath 資料夾的完整路徑
 * @returns 資料夾大小資訊，若路徑無效則回傳 null
 */
export async function getDirectorySizeInfo(folderPath: string): Promise<DirectorySizeInfo | null> {
  const stdout = await runPowerShell(getFolderSizeScript, folderPath);
  const trimmed = stdout.trim();
  if (!trimmed || trimmed === "null") return null;
  const result = JSON.parse(trimmed);
  return result;
}
