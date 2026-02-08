import { generateContribute } from "@/contribute";
import { build } from "esbuild";
import { spawn } from "child_process";
import fs from "fs-extra";
import * as path from "path";

/**
 * 編譯 VS Code 擴充功能主程式
 */
async function buildExtension() {
  await build({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    external: ["vscode", "sharp"],
    outfile: "dist/extension.js",
    loader: { ".svg": "dataurl", ".css": "text" },
    minify: true,
    alias: { "@": "./src" },
    banner: {
      js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
    },
  });

  console.log("✓ Extension bundle built successfully");
}

/**
 * 編譯 Webview 前端程式
 */
async function buildWebview(params: { srcPath: string; outPath: string; alias: Record<string, string> }) {
  const { srcPath, outPath, alias } = params;

  await build({
    entryPoints: [srcPath],
    bundle: true,
    platform: "browser",
    format: "iife",
    outfile: outPath,
    jsx: "automatic",
    minify: true,
    alias: { "@": "./src", ...alias },
  });

  console.log(`✓ Built WebView bundle: ${path.basename(outPath)}`);
}

/**
 * 備份 package.json 並注入動態生成的貢獻點設定
 */
async function backupAndInjectContribute() {
  const packageJsonPath = path.resolve("package.json");
  const backupPath = path.resolve("package.json.bak");

  await fs.copyFile(packageJsonPath, backupPath);
  console.log("✓ Backed up package.json to package.json.bak");

  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
  packageJson.contributes = generateContribute();

  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), "utf-8");
  console.log("✓ Injected contributes into package.json");
}

/**
 * 從備份檔案還原 package.json 並移除備份檔
 */
async function restorePackageJson() {
  const packageJsonPath = path.resolve("package.json");
  const backupPath = path.resolve("package.json.bak");

  if (await fs.pathExists(backupPath)) {
    await fs.rm(packageJsonPath);
    await fs.rename(backupPath, packageJsonPath);
    console.log("✓ Restored package.json from backup");
  }
}

/**
 * 執行 vsce 指令將擴充功能打包成 .vsix 檔案
 */
async function packageExtension() {
  console.log();

  await new Promise<void>((resolve, reject) => {
    const vsceProcess = spawn(
      "npx",
      ["vsce", "package", "--out", ".", "--allow-missing-repository", "--skip-license"],
      { stdio: "inherit", shell: true },
    );

    vsceProcess.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`vsce exited with code ${code}`));
    });
  });

  console.log();

  console.log("✓ Successfully packaged extension");
}

/**
 * 擴充功能構建與打包的主流程入口
 */
async function main() {
  console.log("Starting build process...");

  console.log();

  try {
    await fs.remove("dist");
    console.log("✓ Cleaned dist directory");
  } catch (error) {
    console.error("✗ Cleanup failed:", error);
    process.exit(1);
  }

  console.log();

  try {
    await buildExtension();

    const webviewBuilds = [
      {
        srcPath: "src/webview-explorer/index.tsx",
        outPath: "dist/webviews/explorer.js",
        alias: { "@explorer": "./src/webview-explorer" },
      },
    ] as const;

    for (const buildParams of webviewBuilds) {
      await buildWebview(buildParams);
    }
  } catch (error) {
    console.error("✗ Bundle compilation failed:", error);
    process.exit(1);
  }

  console.log();

  try {
    await backupAndInjectContribute();
    await packageExtension();
    await restorePackageJson();
  } catch (err) {
    await restorePackageJson();

    console.error("✗ Packaging process failed:", err);
    process.exit(1);
  }

  console.log();

  console.log("🚀 All build tasks completed successfully");
  process.exit(0);
}

main();
