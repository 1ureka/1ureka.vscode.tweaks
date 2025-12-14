import { generateContribute } from "@/contribute";
import { build } from "esbuild";
import { spawn } from "child_process";
import fs from "fs-extra";
import * as path from "path";

async function backupAndInjectContribute() {
  const packageJsonPath = path.resolve("package.json");
  const backupPath = path.resolve("package.json.bak");

  // 備份原始 package.json
  fs.copyFileSync(packageJsonPath, backupPath);
  console.log("✓ Backed up package.json to package.json.bak");

  // 讀取原始 package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  // 注入 contributes
  packageJson.contributes = generateContribute();

  // 寫入新的 package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), "utf-8");
  console.log("✓ Injected contributes into package.json");
}

async function restorePackageJson() {
  const packageJsonPath = path.resolve("package.json");
  const backupPath = path.resolve("package.json.bak");

  if (fs.existsSync(backupPath)) {
    // 刪除當前的 package.json
    fs.unlinkSync(packageJsonPath);

    // 還原備份
    fs.renameSync(backupPath, packageJsonPath);
    console.log("✓ Restored package.json from backup");
  }
}

async function buildExtension() {
  await build({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    external: ["vscode", "sharp", "fs-extra", "iconv-lite"],
    outfile: "dist/extension.js",
    loader: { ".svg": "dataurl", ".css": "text" },
    alias: { "@": "./src" },
  });

  console.log("✓ Extension bundle built successfully");
}

async function buildWebviews() {
  const webviewDirs = fs.readdirSync("src/webviews", { withFileTypes: true });
  const webviews = webviewDirs.filter((dirent) => dirent.isDirectory()).map(({ name }) => name);

  for (const dir of webviews) {
    const entryPoint = `src/webviews/${dir}/index.tsx`;
    if (!fs.existsSync(entryPoint)) continue;

    await build({
      entryPoints: [entryPoint],
      bundle: true,
      platform: "browser",
      format: "iife",
      outfile: `dist/webviews/${dir}.js`,
      minify: true,
      alias: { "@": "./src" },
    });

    console.log(`✓ Built WebView bundle: ${dir}`);
  }

  console.log("✓ WebView bundles built successfully");
}

async function packageExtension() {
  await new Promise<void>((resolve, reject) => {
    const vsceProcess = spawn(
      "npx",
      ["vsce", "package", "--out", ".", "--allow-missing-repository", "--skip-license"],
      { stdio: "inherit", shell: true }
    );

    vsceProcess.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`vsce exited with code ${code}`));
    });
  });

  console.log("✓ Successfully packaged extension");
}

async function main() {
  try {
    // 清理舊的構建產物
    if (fs.existsSync("dist")) fs.rmSync("dist", { recursive: true, force: true });

    // 備份並注入 contributes
    await backupAndInjectContribute();

    // 執行構建流程
    await buildExtension();
    await buildWebviews();
    await packageExtension();

    // 還原 package.json
    await restorePackageJson();

    console.log("\n✓ Build completed successfully");
    process.exit(0);
  } catch (err) {
    console.error("\n✗ Build failed:", err);

    // 確保即使構建失敗也要還原 package.json
    await restorePackageJson();

    process.exit(1);
  }
}

main();
