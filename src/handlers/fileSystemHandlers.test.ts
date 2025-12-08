import * as path from "path";
import * as fs from "fs";
import * as fsExtra from "fs-extra";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { handleInitialData, handleReadDirectory } from "./fileSystemHandlers";

const TEMP_DIR = path.join(process.cwd(), "tests", "temp");

// --------------------------------------------------------------------

describe("handleInitialData", () => {
  it("應該返回初始化的目錄資料結構", () => {
    const result = handleInitialData({ dirPath: "/test/path" });

    expect(result).toMatchObject({
      currentPath: expect.any(String),
      currentPathParts: expect.any(Array),
      isCurrentRoot: expect.any(Boolean),
      fileCount: 0,
      folderCount: 0,
      entries: [],
      timestamp: expect.any(Number),
    });
  });

  it("應該正確解析路徑為絕對路徑", () => {
    const result = handleInitialData({ dirPath: "../test" });
    expect(path.isAbsolute(result.currentPath)).toBe(true);
  });

  // TODO: 確保該測試有被專門的 CI/CD 執行到，不然實際上只測試了 win32 平台，也不一定要在 release 前跑，可以先實現一個手動觸發的 CI/CD
  it("應該正確識別根目錄", () => {
    const rootPath = process.platform === "win32" ? "C:\\" : "/";
    const result = handleInitialData({ dirPath: rootPath });
    expect(result.isCurrentRoot).toBe(true);
  });

  // TODO: 確保該測試有被專門的 CI/CD 執行到，不然實際上只測試了 win32 平台
  it("應該正確處理不同平台的路徑分隔符", () => {
    const testPath = process.platform === "win32" ? "C:\\Users\\test\\file.txt" : "/home/test/file.txt";
    const result = handleInitialData({ dirPath: testPath });
    expect(result.currentPath).toBe(path.resolve(testPath));
  });
});

// --------------------------------------------------------------------

describe("handleReadDirectory", () => {
  let testDir: string;

  beforeEach(async () => {
    // 建立臨時測試目錄
    testDir = path.join(TEMP_DIR, `vscode-test-${Date.now()}`);
    await fs.promises.mkdir(testDir, { recursive: true });

    // 建立測試檔案和資料夾
    await fs.promises.writeFile(path.join(testDir, "file1.txt"), "content1");
    await fs.promises.writeFile(path.join(testDir, "file2.txt"), "content2");
    await fs.promises.mkdir(path.join(testDir, "subfolder"));
  });

  afterEach(async () => {
    await fsExtra.remove(testDir);
  });

  it("應該正確讀取目錄內容", async () => {
    const result = await handleReadDirectory({ dirPath: testDir });

    expect(result.entries).toHaveLength(3);
    expect(result.fileCount).toBe(2);
    expect(result.folderCount).toBe(1);
  });

  it("應該包含檔案的詳細資訊", async () => {
    const result = await handleReadDirectory({ dirPath: testDir });
    const file = result.entries.find((e) => e.fileName === "file1.txt");

    expect(file).toBeDefined();
    expect(file?.fileType).toBe("file");
    expect(file?.fileSize).toBeDefined();
    expect(file?.mtime).toBeGreaterThan(0);
    expect(file?.ctime).toBeGreaterThan(0);
  });

  it("當目錄不存在時應該返回空結果", async () => {
    const result = await handleReadDirectory({ dirPath: "/non-existent-dir" });

    expect(result.entries).toEqual([]);
    expect(result.fileCount).toBe(0);
    expect(result.folderCount).toBe(0);
  });
});
