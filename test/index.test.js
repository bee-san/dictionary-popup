import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { results } from "../example/sample.js";
import { inlineModule } from "../scripts/build.mjs";
import { normalizeResult } from "../src/index.js";
import * as core from "../src/core.js";

test("src/inline.js is built from popup/ as it is now", () => {
  assert.equal(readFileSync(new URL("../src/inline.js", import.meta.url), "utf8"), inlineModule(), "run `npm run build`");
});

test("a Hoshidicts result becomes what the renderer reads", () => {
  const r = normalizeResult(results[0], 3);
  assert.equal(r.index, 3);
  assert.deepEqual(r.process.map((p) => p.name), ["-た", "negative", "potential or passive"]);
  assert.deepEqual(r.term.ruleTags, ["v1", "vt"]);
  assert.equal(r.term.termTags, "⭐ news");
  assert.equal(r.term.glossaries[0].dictName, "JMdict");
  assert.deepEqual(r.term.glossaries[0].definitionTagList, ["1", "v1", "vt"]);
  assert.deepEqual(r.term.frequencies[0], { dictName: "JPDB", displayValueText: "198", frequencies: [{ value: 198, displayValue: "198" }] });
  // The harmonic mean of 198 and 412.
  assert.equal(r.term.frequencyHarmonicRank, 267);
  assert.deepEqual(r.term.pitches[0], { dictName: "NHK", pitchPositions: [2], nasalPositions: [], devoicePositions: [] });
});

test("LFG's own shape passes through", () => {
  const r = normalizeResult({
    matched: "猫",
    process: [],
    term: { expression: "猫", reading: "ねこ", glossaries: [{ dictName: "A", glossary: "[]", definitionTags: "n" }], pitches: [{ dictName: "P", pitchPositions: [1] }] },
  });
  assert.equal(r.term.glossaries[0].dictName, "A");
  assert.deepEqual(r.term.pitches[0].pitchPositions, [1]);
  assert.equal(r.term.frequencyHarmonicRank, undefined);
});

test("a kanji result is left as it is", () => {
  const kanji = { matched: "猫", kanji: { character: "猫" } };
  assert.deepEqual(normalizeResult(kanji, 1), { ...kanji, index: 1 });
});

test("core is the same conversion, without the inline page", () => {
  assert.equal(core.normalizeResult, normalizeResult);
  assert.throws(() => core.createDictionaryPopup({ appendChild() {} }, {}), /needs `src`/);
});
