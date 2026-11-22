// Writes src/base-css.js from a checkout of LFG (bee-san/LearnFromGames), where
// the entry's look is developed: node scripts/sync-from-lfg.mjs ../LearnFromGames
// The rest of src/ is a port of LFG's Kotlin by hand (EntryHtml.kt,
// Pronunciation.kt, Palette.kt): bring changes there across the same way.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lfg = process.argv[2];
if (!lfg) {
  console.error("Say where LFG's checkout is: node scripts/sync-from-lfg.mjs ../LearnFromGames");
  process.exit(1);
}
const kotlin = readFileSync(join(lfg, "app/src/main/kotlin/io/github/beesan/lfg/dict/EntryHtml.kt"), "utf8");
const css = kotlin.match(/const val BASE_CSS = """\n([\s\S]*?)"""/)?.[1];
if (!css) {
  console.error("EntryHtml.kt has no BASE_CSS any more: look at how it keeps its styles now.");
  process.exit(1);
}
writeFileSync(
  join(root, "src", "base-css.js"),
  "// LFG's own look for an entry (EntryHtml.kt's BASE_CSS), as it is there. Written by scripts/sync-from-lfg.mjs: don't edit it.\n" +
    `export const BASE_CSS = ${JSON.stringify(css)};\n`,
);
console.log("src/base-css.js written");
