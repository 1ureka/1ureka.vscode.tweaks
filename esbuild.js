import { build } from "esbuild";
import { spawn } from "child_process";

async function main() {
  // Build extension (Node.js environment)
  await build({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    external: ["vscode"],
    outfile: "dist/extension.js",
    loader: { ".svg": "dataurl" },
  });

  console.log("✓ Extension bundle built successfully");

  // TODO: 改成自動掃描 src/webviews 目錄下的所有檔案並打包
  // Build webviews (Browser environment)
  await build({
    entryPoints: ["src/webviews/imageWall/index.tsx"],
    bundle: true,
    platform: "browser",
    format: "iife",
    outfile: "dist/webviews/imageWall.js",
    minify: true,
  });

  console.log("✓ WebView bundles built successfully");

  // Package with vsce
  await new Promise((resolve, reject) => {
    const vsceProcess = spawn(
      "npx",
      ["vsce", "package", "--out", ".", "--allow-missing-repository", "--skip-license"],
      { stdio: "inherit", shell: true }
    );

    vsceProcess.on("close", (code) => {
      if (code === 0) {
        console.log("✓ Successfully packaged extension");
        resolve();
      } else {
        reject(new Error(`vsce exited with code ${code}`));
      }
    });
  });
}

main().catch((err) => {
  console.error("✗ Build failed:", err);
  process.exit(1);
});
