import { build } from "esbuild";
import { execSync, spawn } from "child_process";
import fs from "fs-extra";

/**
 * 編譯 VS Code 擴充功能主程式
 */
async function buildExtension() {
  await build({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    external: ["sharp", "vscode"],
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
 * 執行 vsce 指令將擴充功能打包成 .vsix 檔案
 */
async function packageExtension() {
  console.log("Checking environment for vsce...");

  // 檢查 vsce 是否已安裝在環境中
  try {
    execSync("vsce --version", { stdio: "ignore" });
  } catch {
    console.error("❌ Error: 'vsce' command not found.");
    console.error("   Please install it globally using: npm install -g @vscode/vsce");
    process.exit(1);
  }

  console.log("✓ Environment check passed (vsce found)");
  console.log();

  await new Promise<void>((resolve, reject) => {
    const vsceProcess = spawn("vsce", ["package", "--out", ".", "--allow-missing-repository", "--skip-license"], {
      stdio: "inherit",
      shell: true,
    });

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
  } catch (error) {
    console.error("✗ Bundle compilation failed:", error);
    process.exit(1);
  }

  console.log();

  try {
    await packageExtension();
  } catch (err) {
    console.error("✗ Packaging process failed:", err);
    process.exit(1);
  }

  console.log();

  console.log("🚀 All build tasks completed successfully");
  process.exit(0);
}

main();
