// Copies Hachidori's popup (bee-san/hachidori) into src/hachidori, as it is
// there: node scripts/sync-from-hachidori.mjs ../hachidori [ref]
// It reads the files from git (origin/main unless you name another ref), so a
// checkout with work in progress is left alone. Nothing in src/hachidori is
// edited by hand: what the popup needs changed for a page that isn't the
// extension is in src/index.js and src/embed-css.js.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const [repo, ref = "origin/main"] = process.argv.slice(2);
if (!repo) {
  console.error("Say where Hachidori's checkout is: node scripts/sync-from-hachidori.mjs ../hachidori [ref]");
  process.exit(1);
}
const git = (...args) => execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", maxBuffer: 64 << 20 });
const commit = git("rev-parse", ref).trim();
const read = (path) => git("show", `${commit}:${path}`);
const out = join(root, "src", "hachidori");
mkdirSync(out, { recursive: true });
const note = (path) => `// Hachidori's ${path} at ${commit.slice(0, 12)}, as it is there. Written by scripts/sync-from-hachidori.mjs: don't edit it.\n`;

// Each script as a module. They're classic scripts that hang what they make on
// globalThis (HDPopup, HDGlossary, HDExternalLinks) and find each other there,
// so the module exports what it hung.
const scripts = [
  ["extension/external-links.js", "external-links.js", "HDExternalLinks"],
  ["extension/render/glossary.js", "glossary.js", "HDGlossary"],
  ["extension/render/popup.js", "popup.js", "HDPopup"],
];
for (const [from, to, global] of scripts) {
  writeFileSync(join(out, to), `// @ts-nocheck\n${note(from)}${read(from)}\nexport default globalThis.${global};\n`);
}

// Each stylesheet as a string, a line of CSS to a line of JavaScript so a change reads as one.
const sheets = [
  ["extension/render/reader.css", "reader-css.js"],
  ["extension/icons.css", "icons-css.js"],
];
for (const [from, to] of sheets) {
  const lines = read(from).split("\n").map((line) => `  ${JSON.stringify(line)},`);
  writeFileSync(join(out, to), `${note(from)}export default [\n${lines.join("\n")}\n].join("\\n");\n`);
}

// Whose work it is.
writeFileSync(join(out, "ATTRIBUTION.md"), read("extension/render/ATTRIBUTION.md"));
writeFileSync(join(out, "LICENSE.fluent-icons"), read("extension/icons/fluent/LICENSE"));
writeFileSync(
  join(out, "source.json"),
  JSON.stringify({ repository: "https://github.com/bee-san/hachidori", commit, files: Object.fromEntries([...scripts, ...sheets].map(([from, to]) => [to, from])) }, null, 2) + "\n",
);
console.log(`src/hachidori is Hachidori ${commit.slice(0, 12)}`);
