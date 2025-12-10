/* eslint-disable @typescript-eslint/no-unused-vars */

import * as path from "path";
import * as fs from "fs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanupFixtures, getFixturesPath, setupFixtures } from "./fixtures.helpers";

import { handleInitialData, handleReadDirectory, handleGoto } from "@/handlers/fileSystemHandlers";
import { handleCreateDir, handleCreateFile, handlePaste } from "@/handlers/fileSystemHandlers";

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

  it("應該正確解析相對路徑為絕對路徑", () => {
    const result = handleInitialData({ dirPath: "./relative/path" });
    expect(path.isAbsolute(result.currentPath)).toBe(true);
  });

  it("應該正確識別根目錄(Windows)", () => {
    if (process.platform !== "win32") return;
    const result = handleInitialData({ dirPath: "C:\\" });
    expect(result.isCurrentRoot).toBe(true);
  });

  it("應該正確識別根目錄(Unix)", () => {
    if (process.platform === "win32") return;
    const result = handleInitialData({ dirPath: "/" });
    expect(result.isCurrentRoot).toBe(true);
  });

  it("應該正確分割路徑為陣列", () => {
    const testPath = process.cwd();
    const expectedParts = testPath.split(path.sep).filter((part) => part !== "");
    const result = handleInitialData({ dirPath: testPath });
    expect(result.currentPathParts.length).toBeGreaterThan(0);
    expect(result.currentPathParts).toEqual(expectedParts);
  });

  it("timestamp 應該是有效的時間戳記", () => {
    const before = Date.now();
    const result = handleInitialData({ dirPath: "/test" });
    const after = Date.now();
    expect(result.timestamp).toBeGreaterThanOrEqual(before);
    expect(result.timestamp).toBeLessThanOrEqual(after);
  });
});

// --------------------------------------------------------------------

describe("handleReadDirectory - 基本讀取功能", () => {
  beforeEach(async () => {
    await setupFixtures();
  });

  afterEach(async () => {
    await cleanupFixtures();
  });

  it("應該正確讀取空資料夾", async () => {
    const result = await handleReadDirectory({ dirPath: getFixturesPath("empty-folder") });

    expect(result.entries).toHaveLength(0);
    expect(result.fileCount).toBe(0);
    expect(result.folderCount).toBe(0);
  });

  it("應該正確讀取包含多個檔案的資料夾", async () => {
    const result = await handleReadDirectory({ dirPath: getFixturesPath("multiple-files") });

    expect(result.entries).toHaveLength(3);
    expect(result.fileCount).toBe(3);
    expect(result.folderCount).toBe(0);
  });

  it("應該處理特殊字元檔名", async () => {
    const result = await handleReadDirectory({ dirPath: getFixturesPath("special-names") });

    expect(result.entries).toHaveLength(3);

    const fileNames = result.entries.map((e) => e.fileName);

    expect(fileNames).toContain("中文檔案.txt");
    expect(fileNames).toContain("空格 檔案.txt");
    expect(fileNames).toContain("#special!@$%.txt");
  });

  it("當目錄不存在時應該返回空結果", async () => {
    const result = await handleReadDirectory({ dirPath: getFixturesPath("non-existent-folder") });

    expect(result.entries).toEqual([]);
    expect(result.fileCount).toBe(0);
    expect(result.folderCount).toBe(0);
  });
});

// --------------------------------------------------------------------

describe("handleReadDirectory - 檔案詳細資訊", () => {
  beforeEach(async () => {
    await setupFixtures();
  });

  afterEach(async () => {
    await cleanupFixtures();
  });

  it("應該包含檔案的完整詳細資訊", async () => {
    const result = await handleReadDirectory({ dirPath: getFixturesPath("multiple-files") });
    const file = result.entries.find((e) => e.fileName === "file1.txt");

    expect(file).toBeDefined();
    expect(file?.fileType).toBe("file");
    expect(file?.fileSize).toBeDefined();
    expect(file?.size).toBeGreaterThan(0);
    expect(file?.mtime).toBeGreaterThan(0);
    expect(file?.ctime).toBeGreaterThan(0);
  });

  it("應該正確識別空檔案", async () => {
    const result = await handleReadDirectory({ dirPath: getFixturesPath("empty-files") });
    const emptyFile = result.entries.find((e) => e.fileName === "empty1.txt");

    expect(emptyFile?.size).toBe(0);
    expect(emptyFile?.fileSize).toBe("0 B");
  });

  it("應該正確識別資料夾類型", async () => {
    const result = await handleReadDirectory({ dirPath: getFixturesPath("nested-structure") });
    const folder = result.entries.find((e) => e.fileName === "level1");

    expect(folder?.fileType).toBe("folder");
    expect(folder?.size).toBe(0);
  });

  it("應該正確處理混合內容資料夾", async () => {
    const result = await handleReadDirectory({ dirPath: getFixturesPath("mixed-content") });

    const textFile = result.entries.find((e) => e.fileName === "text-file.txt");
    const jsonFile = result.entries.find((e) => e.fileName === "json-file.json");
    const imageFile = result.entries.find((e) => e.fileName === "image-file.png");
    const folder = result.entries.find((e) => e.fileName === "folder1");

    expect(textFile?.fileType).toBe("file");
    expect(jsonFile?.fileType).toBe("file");
    expect(imageFile?.fileType).toBe("file");
    expect(folder?.fileType).toBe("folder");
    expect(imageFile?.size).toBeGreaterThan(0);
  });
});

// --------------------------------------------------------------------

describe("handleCreateFile", () => {
  beforeEach(async () => {
    await setupFixtures();
  });

  afterEach(async () => {
    await cleanupFixtures();
  });

  it("應該成功建立新檔案", async () => {
    const dirPath = getFixturesPath("empty-folder");
    const fileName = "new-test-file.txt";

    const result = await handleCreateFile({
      dirPath,
      fileName,
      showError: (error) => console.error(error),
    });

    expect(result).not.toBeNull();
    expect(result?.entries).toHaveLength(1);

    const newFile = result?.entries.find((e) => e.fileName === fileName);
    expect(newFile).toBeDefined();
    expect(newFile?.fileType).toBe("file");
  });

  it("應該在包含檔案的資料夾中建立新檔案", async () => {
    const dirPath = getFixturesPath("multiple-files");
    const fileName = "file4.txt";

    const result = await handleCreateFile({
      dirPath,
      fileName,
      showError: (error) => console.error(error),
    });

    expect(result?.entries).toHaveLength(4); // 原本 3 個 + 新的 1 個
    expect(result?.fileCount).toBe(4);
  });

  it("應該處理特殊字元檔名", async () => {
    const dirPath = getFixturesPath("empty-folder");
    const fileName = "測試檔案 #123.txt";

    const result = await handleCreateFile({
      dirPath,
      fileName,
      showError: (error) => console.error(error),
    });

    const newFile = result?.entries.find((e) => e.fileName === fileName);
    expect(newFile).toBeDefined();
  });

  it("當檔案已存在時應該覆蓋", async () => {
    const dirPath = getFixturesPath("multiple-files");
    const fileName = "file1.txt"; // 已存在的檔案

    const result = await handleCreateFile({
      dirPath,
      fileName,
      showError: (error) => console.error(error),
    });

    // fs.writeFile 會覆蓋現有檔案，所以應該成功
    expect(result).not.toBeNull();
    expect(result?.entries).toHaveLength(3);
  });

  it("應該正確呼叫 openFile 回調函數", async () => {
    const dirPath = getFixturesPath("empty-folder");
    const fileName = "callback-test.txt";
    let openedFilePath = "";

    await handleCreateFile({
      dirPath,
      fileName,
      showError: (error) => console.error(error),
      openFile: (filePath) => {
        openedFilePath = filePath;
      },
    });

    expect(openedFilePath).toBe(path.join(dirPath, fileName));
  });
});

// --------------------------------------------------------------------

describe("handleCreateDir", () => {
  beforeEach(async () => {
    await setupFixtures();
  });

  afterEach(async () => {
    await cleanupFixtures();
  });

  it("應該成功建立新資料夾", async () => {
    const dirPath = getFixturesPath("empty-folder");
    const folderName = "new-subfolder";

    const result = await handleCreateDir({
      dirPath,
      folderName,
      showError: (error) => console.error(error),
    });

    expect(result).not.toBeNull();
    expect(result?.entries).toHaveLength(1);

    const newFolder = result?.entries.find((e) => e.fileName === folderName);
    expect(newFolder).toBeDefined();
    expect(newFolder?.fileType).toBe("folder");
  });

  it("應該在包含內容的資料夾中建立新資料夾", async () => {
    const dirPath = getFixturesPath("multiple-files");
    const folderName = "new-folder";

    const result = await handleCreateDir({
      dirPath,
      folderName,
      showError: (error) => console.error(error),
    });

    expect(result?.entries).toHaveLength(4); // 3 檔案 + 1 新資料夾
    expect(result?.folderCount).toBe(1);
    expect(result?.fileCount).toBe(3);
  });

  it("應該處理特殊字元資料夾名", async () => {
    const dirPath = getFixturesPath("empty-folder");
    const folderName = "測試資料夾 #123";

    const result = await handleCreateDir({
      dirPath,
      folderName,
      showError: (error) => console.error(error),
    });

    const newFolder = result?.entries.find((e) => e.fileName === folderName);
    expect(newFolder).toBeDefined();
  });

  it("當資料夾已存在時應該產生錯誤", async () => {
    const dirPath = getFixturesPath("nested-structure");
    const folderName = "level1"; // 已存在的資料夾

    let errorMessage = "";
    const result = await handleCreateDir({
      dirPath,
      folderName,
      showError: (error) => {
        errorMessage = error;
      },
    });

    expect(errorMessage).toContain("無法建立新資料夾");
    expect(result).toBeNull();
  });
});

// --------------------------------------------------------------------

describe("handleGoto", () => {
  beforeEach(async () => {
    await setupFixtures();
  });

  afterEach(async () => {
    await cleanupFixtures();
  });

  it("應該成功跳轉到存在的資料夾", async () => {
    const targetPath = getFixturesPath("multiple-files");

    const result = await handleGoto({
      getInputPath: async () => targetPath,
      onError: (error) => console.error(error),
    });

    expect(result).not.toBeNull();
    expect(result?.currentPath).toBe(path.resolve(targetPath));
    expect(result?.entries).toHaveLength(3);
  });

  it("應該跳轉到檔案所在的父資料夾", async () => {
    const filePath = getFixturesPath("multiple-files", "file1.txt");

    const result = await handleGoto({
      getInputPath: async () => filePath,
      onError: (error) => console.error(error),
    });

    expect(result).not.toBeNull();
    expect(result?.currentPath).toBe(getFixturesPath("multiple-files"));
    expect(result?.entries).toHaveLength(3);
  });

  it("應該處理相對路徑", async () => {
    const relativePath = path.relative(process.cwd(), getFixturesPath("empty-folder"));

    const result = await handleGoto({
      getInputPath: async () => relativePath,
      onError: (error) => console.error(error),
    });

    expect(result).not.toBeNull();
    expect(result?.currentPath).toBe(path.resolve(getFixturesPath("empty-folder")));
  });

  it("當路徑不存在時應該產生錯誤", async () => {
    const nonExistentPath = getFixturesPath("non-existent-path");
    let errorMessage = "";

    const result = await handleGoto({
      getInputPath: async () => nonExistentPath,
      onError: (error) => {
        errorMessage = error;
      },
    });

    expect(result).toBeNull();
    expect(errorMessage).toBe("路徑不存在");
  });

  it("當使用者取消輸入時應該返回 null", async () => {
    const result = await handleGoto({
      getInputPath: async () => undefined,
      onError: (error) => console.error(error),
    });

    expect(result).toBeNull();
  });
});

// --------------------------------------------------------------------

describe("handlePaste - 複製操作", () => {
  beforeEach(async () => {
    await setupFixtures();
  });

  afterEach(async () => {
    await cleanupFixtures();
  });

  it("應該成功複製單一檔案 (不覆蓋)", async () => {
    const srcList = [getFixturesPath("copy-move-source", "copy-file2.txt")];
    const destDir = getFixturesPath("copy-move-target");

    const result = await handlePaste({
      srcList,
      destDir,
      type: "copy",
      overwrite: false,
      withProgress: async (_title, fn) => await fn((_progress) => {}),
      showErrorReport: (content) => console.error(content),
    });

    expect(result).not.toBeNull();
    expect(result?.entries).toHaveLength(2); // 原本的 copy-file1.txt + 新的 copy-file2.txt
  });

  it("應該成功複製多個檔案", async () => {
    const srcList = [getFixturesPath("multiple-files", "file1.txt"), getFixturesPath("multiple-files", "file2.txt")];
    const destDir = getFixturesPath("empty-folder");

    const result = await handlePaste({
      srcList,
      destDir,
      type: "copy",
      overwrite: false,
      withProgress: async (_title, fn) => await fn((_progress) => {}),
      showErrorReport: (content) => console.error(content),
    });

    expect(result?.entries).toHaveLength(2);
  });

  it("應該成功複製資料夾及其內容", async () => {
    const srcList = [getFixturesPath("copy-move-source", "copy-folder")];
    const destDir = getFixturesPath("empty-folder");

    const result = await handlePaste({
      srcList,
      destDir,
      type: "copy",
      overwrite: false,
      withProgress: async (_title, fn) => await fn((_progress) => {}),
      showErrorReport: (content) => console.error(content),
    });

    expect(result?.entries).toHaveLength(1);

    // 驗證內部檔案也被複製
    const copiedFolder = getFixturesPath("empty-folder", "copy-folder");
    const nestedFileExists = await fs.promises
      .access(path.join(copiedFolder, "nested-file.txt"))
      .then(() => true)
      .catch(() => false);
    expect(nestedFileExists).toBe(true);
  });

  it("不覆蓋模式下，應該跳過同名檔案且其它不同名項目仍然被複製", async () => {
    // TODO: 複製完成後，檢查預期被跳過的 target 內容是否仍是原本的內容，檢查預期要複製的項目是否有被正確複製
  });

  it("覆蓋模式下應該成功覆蓋同名檔案", async () => {
    const srcList = [getFixturesPath("copy-move-source", "copy-file1.txt")];
    const destDir = getFixturesPath("copy-move-target");

    const result = await handlePaste({
      srcList,
      destDir,
      type: "copy",
      overwrite: true,
      withProgress: async (_title, fn) => await fn((_progress) => {}),
      showErrorReport: (content) => console.error(content),
    });

    expect(result).not.toBeNull();

    // 驗證內容被覆蓋
    const content = await fs.promises.readFile(getFixturesPath("copy-move-target", "copy-file1.txt"), "utf-8");
    expect(content).toBe("Source file 1 content");
  });

  it("複製後來源檔案應該仍然存在", async () => {
    const srcFile = getFixturesPath("multiple-files", "file1.txt");
    const srcList = [srcFile];
    const destDir = getFixturesPath("empty-folder");

    await handlePaste({
      srcList,
      destDir,
      type: "copy",
      overwrite: false,
      withProgress: async (_title, fn) => await fn((_progress) => {}),
      showErrorReport: (content) => console.error(content),
    });

    // 來源檔案應該仍然存在
    const srcExists = await fs.promises
      .access(srcFile)
      .then(() => true)
      .catch(() => false);
    expect(srcExists).toBe(true);
  });
});

// --------------------------------------------------------------------

describe("handlePaste - 移動操作", () => {
  beforeEach(async () => {
    await setupFixtures();
  });

  afterEach(async () => {
    await cleanupFixtures();
  });

  it("應該成功移動單一檔案 (不覆蓋)", async () => {
    const srcList = [getFixturesPath("copy-move-source", "copy-file2.txt")];
    const destDir = getFixturesPath("copy-move-target");

    const result = await handlePaste({
      srcList,
      destDir,
      type: "move",
      overwrite: false,
      withProgress: async (_title, fn) => await fn((_progress) => {}),
      showErrorReport: (content) => console.error(content),
    });

    expect(result).not.toBeNull();
    expect(result?.entries).toHaveLength(2);

    // 來源檔案應該不存在
    const srcExists = await fs.promises
      .access(srcList[0])
      .then(() => true)
      .catch(() => false);
    expect(srcExists).toBe(false);
  });

  it("應該成功移動多個檔案", async () => {
    const srcList = [getFixturesPath("multiple-files", "file1.txt"), getFixturesPath("multiple-files", "file2.txt")];
    const destDir = getFixturesPath("empty-folder");

    const result = await handlePaste({
      srcList,
      destDir,
      type: "move",
      overwrite: false,
      withProgress: async (_title, fn) => await fn((_progress) => {}),
      showErrorReport: (content) => console.error(content),
    });

    expect(result?.entries).toHaveLength(2);

    // 來源資料夾應該只剩 file3.txt
    const remainingInSrc = await handleReadDirectory({
      dirPath: getFixturesPath("multiple-files"),
    });
    expect(remainingInSrc.entries).toHaveLength(1);
  });

  it("應該成功移動資料夾及其內容", async () => {
    const srcList = [getFixturesPath("copy-move-source", "copy-folder")];
    const destDir = getFixturesPath("empty-folder");

    const result = await handlePaste({
      srcList,
      destDir,
      type: "move",
      overwrite: false,
      withProgress: async (_title, fn) => await fn((_progress) => {}),
      showErrorReport: (content) => console.error(content),
    });

    expect(result?.entries).toHaveLength(1);

    // 來源資料夾應該不存在
    const srcExists = await fs.promises
      .access(srcList[0])
      .then(() => true)
      .catch(() => false);
    expect(srcExists).toBe(false);
  });

  it("不覆蓋模式下，應該跳過同名檔案且其它不同名項目仍然被移動", async () => {
    // TODO: 移動完成後，檢查預期被跳過的 target 內容是否仍是原本的內容，檢查預期要移動的項目是否有被正確移動 (檢查新內容與來源要不存在)
  });

  it("覆蓋模式下應該成功覆蓋同名檔案", async () => {
    const srcList = [getFixturesPath("copy-move-source", "copy-file1.txt")];
    const destDir = getFixturesPath("copy-move-target");

    const result = await handlePaste({
      srcList,
      destDir,
      type: "move",
      overwrite: true,
      withProgress: async (_title, fn) => await fn((_progress) => {}),
      showErrorReport: (content) => console.error(content),
    });

    expect(result).not.toBeNull();

    // 驗證內容被覆蓋且來源不存在
    const content = await fs.promises.readFile(getFixturesPath("copy-move-target", "copy-file1.txt"), "utf-8");
    expect(content).toBe("Source file 1 content");

    const srcExists = await fs.promises
      .access(srcList[0])
      .then(() => true)
      .catch(() => false);
    expect(srcExists).toBe(false);
  });
});
