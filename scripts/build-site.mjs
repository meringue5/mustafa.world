import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "dist");
const files = [
  "index.html",
  "styles.css",
  "src/main.js",
  "src/terminal-ui.js",
  "src/world.js",
  "src/generated/world-data.js",
  "vendor/xterm/LICENSE",
  "vendor/xterm/xterm.css",
  "vendor/xterm/xterm.js"
];

await rm(outputDir, { recursive: true, force: true });

for (const file of files) {
  const source = path.join(root, file);
  const destination = path.join(outputDir, file);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

await writeFile(path.join(outputDir, ".nojekyll"), "", "utf8");
console.log(`Prepared ${files.length} static files -> ${path.relative(root, outputDir)}/`);
