// Copies the popup's files from a checkout of LFG (bee-san/chimahon), where
// they're developed: node scripts/sync-from-lfg.mjs ../chimahon
// popup/index.html is this package's own and stays as it is.
import { copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lfg = process.argv[2];
if (!lfg) {
  console.error("Say where LFG's checkout is: node scripts/sync-from-lfg.mjs ../chimahon");
  process.exit(1);
}
for (const file of ["base.css", "renderer.js", "kanji-renderer.js"]) {
  copyFileSync(join(lfg, "chimahon", "src", "main", "assets", "dictionary", file), join(root, "popup", file));
}
console.log("popup/ copied from LFG. Now run `npm run build`.");
