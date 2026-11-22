import assert from "node:assert/strict";
import { test } from "node:test";
import { colour, customProperties, olderDictionarySheet, olderSheet, plainColours, rgba, unnested } from "../src/legacy.js";

const near = (got, want) => got.every((v, i) => Math.abs(v - want[i]) <= (i === 3 ? 0.005 : 1));

test("a colour an older browser can't read is worked out as the browser would", () => {
  assert.deepEqual(colour("#a89ce4"), [168, 156, 228, 1]);
  assert.deepEqual(colour("#fff8"), [255, 255, 255, 136 / 255]);
  assert.deepEqual(colour("rgb(3 24 22 / 62%)"), [3, 24, 22, 0.62]);
  assert.deepEqual(colour("rgba(255, 255, 255, 0.08)"), [255, 255, 255, 0.08]);
  // What Chrome gives for each of these.
  assert.ok(near(colour("color-mix(in srgb, #272630 85%, transparent)"), [39, 38, 48, 0.85]));
  assert.ok(near(colour("color-mix(in srgb, #e8e5eb 16%, #272630)"), [70, 69, 78, 1]));
  assert.ok(near(colour("color-mix(in srgb, lime, #e8e5eb)"), [116, 242, 118, 1]));
  assert.ok(near(colour("color-mix(in srgb, #a89ce4 calc(85% * 0.18), transparent)"), [168, 156, 228, 0.153]));
  assert.ok(near(colour("color-mix(in srgb, color-mix(in srgb, #272630 72%, #302f3b) 85%, transparent)"), [42, 41, 51, 0.85]));
  assert.ok(near(colour("oklch(62.8% 0.2577 29.23)"), [255, 0, 0, 1]));
  assert.ok(near(colour("oklch(100% 0 0)"), [255, 255, 255, 1]));
  assert.deepEqual(colour("light-dark(#096abd, #59b2ff)", "dark"), [89, 178, 255, 1]);
  assert.deepEqual(colour("light-dark(#096abd, #59b2ff)", "light"), [9, 106, 189, 1]);
  assert.equal(colour("currentColor"), null);
  assert.equal(colour("color-mix(in srgb, var(--x) 5%, transparent)"), null);
  assert.equal(rgba([39.2, 38, 48, 0.8499]), "rgba(39, 38, 48, 0.85)");
});

test("what can't be worked out is left as it was written", () => {
  assert.equal(plainColours("1px solid color-mix(in srgb, green 50%, transparent)"), "1px solid rgba(0, 128, 0, 0.5)");
  assert.equal(plainColours("color-mix(in srgb, currentColor 6%, transparent)"), "color-mix(in srgb, currentColor 6%, transparent)");
  const lookup = (name) => ({ "--text-color": "#ffffff" })[name];
  assert.equal(plainColours("color-mix(in srgb, var(--text-color, var(--fg, #333)) 50%, black)", "dark", lookup), "rgba(128, 128, 128, 1)");
  assert.equal(plainColours("color-mix(in srgb, var(--fg, #000) 50%, white)", "dark", lookup), "rgba(128, 128, 128, 1)");
  assert.equal(plainColours("radial-gradient(light-dark(red, blue) 50%, white)", "light"), "radial-gradient(rgba(255, 0, 0, 1) 50%, white)");
});

test("the popup's stylesheet keeps its custom properties and gets one for each colour elsewhere", () => {
  const css = `
    /* a comment with color-mix( in it */
    .gsm-hoshidicts-popup { --a: color-mix(in srgb, var(--b) 16%, transparent); --c: light-dark(#fff, #000) light-dark(red, blue); }
    .tag { background: color-mix(in srgb, var(--a) 8%, var(--b)); border: 1px solid color-mix(in srgb, var(--a) 8%, var(--b)); }
    .gradient { background: radial-gradient(circle, color-mix(in srgb, var(--a) 10%, transparent), transparent), linear-gradient(light-dark(red, blue), white); }
    .hd-icon { mask: var(--hd-icon) center / contain no-repeat; -webkit-mask-size: 1px; }
  `;
  const made = olderSheet(css);
  assert.ok(made.includes("--a: color-mix(in srgb, var(--b) 16%, transparent);"));
  assert.ok(made.includes("--c: light-dark(#fff, #000) light-dark(red, blue);"));
  assert.ok(made.includes(".tag { background: var(--dictionary-popup-colour-1); border: 1px solid var(--dictionary-popup-colour-1); }"));
  assert.ok(made.includes("radial-gradient(circle, var(--dictionary-popup-colour-2), transparent), linear-gradient(var(--dictionary-popup-colour-3), white)"));
  assert.ok(made.includes("--dictionary-popup-colour-1: color-mix(in srgb, var(--a) 8%, var(--b));"));
  assert.ok(made.includes("--dictionary-popup-colour-3: light-dark(red, blue);"));
  assert.ok(made.includes("-webkit-mask: var(--hd-icon) center / contain no-repeat; mask: var(--hd-icon) center / contain no-repeat;"));
  assert.ok(made.includes("-webkit-mask-size: 1px;"));
  assert.ok(!made.includes("a comment"));
  assert.deepEqual(customProperties(made), ["--a", "--c", "--dictionary-popup-colour-1", "--dictionary-popup-colour-2", "--dictionary-popup-colour-3"]);
});

test("a dictionary's nested rules are written out one by one", () => {
  const css = `
    li[data-sc-content="sense"] { padding-left: 0.25em; & ul { list-style-type: none; } }
    div.forms, li.forms { & td { text-align: center; & span { display: block } } }
    td > span { color: white; &::before { content: "△;}"; } }
    .a { .b & { color: red } .c, .d { color: blue } }
    @media (min-width: 10px) { .e { margin: 0; & .f { margin: 1px } } }
  `;
  const made = unnested(css).split("\n").map((line) => line.trim()).filter(Boolean);
  assert.deepEqual(made, [
    'li[data-sc-content="sense"] { padding-left: 0.25em; }',
    ':is(li[data-sc-content="sense"]) ul { list-style-type: none; }',
    ":is(div.forms, li.forms) td { text-align: center; }",
    ":is(:is(div.forms, li.forms) td) span { display: block; }",
    "td > span { color: white; }",
    ':is(td > span)::before { content: "△;}"; }',
    ".b :is(.a) { color: red; }",
    ":is(.a) .c, :is(.a) .d { color: blue; }",
    "@media (min-width: 10px) {",
    ".e { margin: 0; }",
    ":is(.e) .f { margin: 1px; }",
    "}",
  ]);
  assert.equal(olderDictionarySheet(".x { color: color-mix(in srgb, green 5%, transparent); & b { color: red } }").trim(), ".x { color: rgba(0, 128, 0, 0.05); }\n:is(.x) b { color: red; }");
});
