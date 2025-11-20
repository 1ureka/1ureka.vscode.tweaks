import { build } from "esbuild";
import { spawn } from "child_process";

async function main() {
  await build({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    external: ["vscode"],
    outfile: "dist/extension.js",
    loader: { ".svg": "dataurl" },
  });

  // Package with vsce
  await new Promise((resolve, reject) => {
    const vsceProcess = spawn(
      "npx",
      ["vsce", "package", "--out", ".", "--allow-missing-repository", "--skip-license"],
      { stdio: "inherit", shell: true }
    );

    vsceProcess.on("close", (code) => {
      if (code === 0) {
        console.log("Successfully packaged extension");
        resolve();
      } else {
        reject(new Error(`vsce exited with code ${code}`));
      }
    });
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
