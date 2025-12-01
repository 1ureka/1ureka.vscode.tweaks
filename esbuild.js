import { build } from "esbuild";
import { spawn } from "child_process";
import * as fs from "fs";

async function buildExtension() {
  await build({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    external: ["vscode", "sharp"],
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
  await new Promise((resolve, reject) => {
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
  if (fs.existsSync("dist")) fs.rmSync("dist", { recursive: true, force: true });
  await buildExtension();
  await buildWebviews();
  await packageExtension();
  process.exit(0);
}

main().catch((err) => {
  console.error("✗ Build failed:", err);
  process.exit(1);
});
