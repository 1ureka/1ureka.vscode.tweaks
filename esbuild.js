import { build } from "esbuild";
import { copyFileSync, mkdirSync, rmSync } from "fs";
import { resolve as resolvePath } from "path";

async function main() {
  await build({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    external: ["vscode"],
    outfile: "extension.js",
  });

  const outDir = "./dist";
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir);

  copyFileSync("extension.js", resolvePath(outDir, "extension.js"));
  rmSync("extension.js");
  copyFileSync("package.json", resolvePath(outDir, "package.json"));

  // TODO: 呼叫 vsce 打包成 .vsix (用 spawn? 若你有更好的做法也可以)
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
