import { build } from "esbuild";
import { spawnSync } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";

await mkdir(".build", { recursive: true });
try {
  await build({
    entryPoints: ["web/src/render.jsx"],
    outfile: ".build/render.cjs",
    bundle: true,
    platform: "node",
    format: "cjs",
    packages: "external",
    jsx: "automatic",
  });
  for (const args of [
    [".build/render.cjs"],
    [
      "node_modules/@tailwindcss/cli/dist/index.mjs",
      "-i",
      "web/src/styles.css",
      "-o",
      "web/public/assets/styles.css",
      "--minify",
    ],
  ]) {
    const result = spawnSync(process.execPath, args, { stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.status !== 0)
      throw new Error(`El build falló (${result.status}): ${args[0]}`);
  }
} finally {
  await rm(".build", { recursive: true, force: true });
}
