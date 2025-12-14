import fs from "fs-extra";
import * as path from "path";
import sharp from "sharp";

const FIXTURES_DIR = path.join(process.cwd(), "tests", "fixtures");

console.log(`測試的 fixtures 位置被判定為: ${FIXTURES_DIR}`);

/** 生成指定大小的測試 PNG 圖片 */
async function generateTestImage(filePath: string, width = 100, height = 100): Promise<void> {
  await sharp({ create: { width, height, channels: 4, background: { r: 100, g: 150, b: 200, alpha: 1 } } })
    .png()
    .toFile(filePath);
}

/** 建立單個檔案 */
async function createFile(filePath: string, content: string = ""): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf-8");
}

/** 建立空資料夾 */
async function createFolder(folderPath: string): Promise<void> {
  await fs.mkdir(folderPath, { recursive: true });
}

/**
 * 刪除並重建 fixtures 資料夾
 */
export async function setupFixtures(): Promise<void> {
  // 重新建立 fixtures 資料夾
  await fs.remove(FIXTURES_DIR);
  await fs.mkdir(FIXTURES_DIR, { recursive: true });

  // ========== 基本檔案與資料夾 ==========

  // 1. empty-folder: 空資料夾
  await createFolder(path.join(FIXTURES_DIR, "empty-folder"));

  // 2. multiple-files: 多個檔案的資料夾
  await createFile(path.join(FIXTURES_DIR, "multiple-files", "file1.txt"), "Content of file 1");
  await createFile(path.join(FIXTURES_DIR, "multiple-files", "file2.txt"), "Content of file 2");
  await createFile(path.join(FIXTURES_DIR, "multiple-files", "file3.txt"), "Content of file 3");

  // 3. nested-structure: 巢狀結構
  await createFile(path.join(FIXTURES_DIR, "nested-structure", "root-file.txt"), "Root file content");
  await createFile(
    path.join(FIXTURES_DIR, "nested-structure", "level1", "level2", "deep-file.txt"),
    "Deep nested file content"
  );

  // 4. special-names: 特殊字元檔名
  await createFile(path.join(FIXTURES_DIR, "special-names", "中文檔案.txt"), "中文內容測試");
  await createFile(path.join(FIXTURES_DIR, "special-names", "空格 檔案.txt"), "File with spaces");
  await createFile(path.join(FIXTURES_DIR, "special-names", "#special!@$%.txt"), "Special characters file");

  // 5. empty-files: 空檔案
  await createFile(path.join(FIXTURES_DIR, "empty-files", "empty1.txt"), "");
  await createFile(path.join(FIXTURES_DIR, "empty-files", "empty2.txt"), "");

  // ========== 測試複製/移動的來源與目標 ==========

  // 6. copy-move-source: 複製操作的來源資料夾
  await createFile(path.join(FIXTURES_DIR, "copy-move-source", "copy-file1.txt"), "Source file 1 content");
  await createFile(path.join(FIXTURES_DIR, "copy-move-source", "copy-file2.txt"), "Source file 2 content");
  await createFile(
    path.join(FIXTURES_DIR, "copy-move-source", "copy-folder", "nested-file.txt"),
    "Nested source file content"
  );

  // 7. copy-move-target: 複製操作的目標資料夾 (包含一個衝突檔案)
  await createFile(
    path.join(FIXTURES_DIR, "copy-move-target", "copy-file1.txt"),
    "Target existing file content (will be overwritten)"
  );

  // ========== 混合場景 ==========

  // 8. mixed-content: 包含各種檔案類型
  await createFile(path.join(FIXTURES_DIR, "mixed-content", "text-file.txt"), "Plain text content");
  await createFile(path.join(FIXTURES_DIR, "mixed-content", "markdown-file.md"), "# Markdown Title\n\nContent here");
  await generateTestImage(path.join(FIXTURES_DIR, "mixed-content", "image-file.png"), 200, 150);
  await createFolder(path.join(FIXTURES_DIR, "mixed-content", "folder1"));
  await createFile(
    path.join(FIXTURES_DIR, "mixed-content", "json-file.json"),
    JSON.stringify({ key: "value", array: [1, 2, 3] }, null, 2)
  );
}

/**
 * 清理 fixtures 資料夾
 */
export async function cleanupFixtures(): Promise<void> {
  await fs.remove(FIXTURES_DIR);
}

/**
 * 取得 fixtures 資料夾路徑
 */
export function getFixturesPath(...segments: string[]): string {
  return path.join(FIXTURES_DIR, ...segments);
}
