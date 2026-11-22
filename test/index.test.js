import assert from "node:assert/strict";
import { test } from "node:test";
import { results } from "../example/sample.js";
import { accents, body, colours, frequencyRank, furigana, glossary, hostCss, listBody, morae, paletteOf, path, scope, shortName, toEntry } from "../src/index.js";

const eat = toEntry(results[0]);

test("a Hoshidicts result becomes LFG's entry, under either name of a field", () => {
  assert.equal(eat.expression, "食べる");
  assert.equal(eat.glossaries[0].dictionary, "JMdict");
  assert.deepEqual(eat.frequencies[0], { dictionary: "JPDB_v2.2_Frequency_Kana", values: [{ value: 198, display: "198" }] });
  assert.deepEqual(eat.pitches[0], { dictionary: "NHK", values: [{ position: 2 }] });
  const lfg = toEntry({ matched: "猫", process: [], term: { expression: "猫", glossaries: [{ dictName: "A", glossary: "[]" }], pitches: [{ dictName: "P", pitchPositions: [1] }] } });
  assert.equal(lfg.glossaries[0].dictionary, "A");
  assert.deepEqual(lfg.pitches[0].values, [{ position: 1 }]);
});

test("the reading goes over the kanji alone", () => {
  assert.equal(furigana("新しい", "あたらしい"), "<ruby>新<rt>あたら</rt></ruby>しい");
  assert.equal(furigana("お茶", "おちゃ"), "お<ruby>茶<rt>ちゃ</rt></ruby>");
  assert.equal(furigana("たべる", "たべる"), "たべる");
  assert.equal(furigana("カタカナ", "かたかな"), "カタカナ");
  assert.equal(furigana("景色", "けしき"), "<ruby>景色<rt>けしき</rt></ruby>");
  assert.equal(furigana("<b>", ""), "&lt;b&gt;");
});

test("accents are worked out as Yomitan does", () => {
  assert.deepEqual(morae("きょう"), ["きょ", "う"]);
  // A verb with a drop is kifuku, whichever mora it drops after.
  assert.deepEqual(accents(eat).map((a) => [a.position, a.kind, a.label]), [[2, "kifuku", "起伏"]]);
  assert.deepEqual(accents(eat)[0].high, [false, true, false, false]);
  const noun = (reading, position) => accents({ expression: "", reading, rules: "n", pitches: [{ values: [{ position }] }] })[0];
  assert.equal(noun("けしき", 1).kind, "atamadaka");
  assert.equal(noun("さかな", 0).kind, "heiban");
  assert.deepEqual(noun("さかな", 0).high, [false, true, true, true]);
  assert.equal(noun("おとこ", 3).kind, "odaka");
  assert.equal(noun("たまご", 2).kind, "nakadaka");
  // A pattern says where the drop is, over the position.
  assert.equal(accents({ expression: "", reading: "たまご", rules: "n", pitches: [{ values: [{ position: 0, pattern: "LHL" }] }] })[0].position, 2);
});

test("frequencies read short, and average as Yomitan's does", () => {
  assert.equal(shortName("JPDB_v2.2_Frequency_Kana"), "JPDB");
  assert.equal(shortName("BCCWJ"), "BCCWJ");
  assert.equal(shortName("Innocent Corpus [2020]"), "Innocent Corpus");
  assert.equal(frequencyRank(eat), 267);
});

test("the path says how the text became the word", () => {
  assert.equal(path(eat), "食べられなかった → 食べる · past · negative · potential or passive");
  assert.equal(path(toEntry(results[1])), "");
});

test("an entry has LFG's parts, and buttons only where they're wanted", () => {
  const html = body(eat, { index: 0, audio: () => true, notes: true });
  for (const part of ['class="lfg-term"', 'class="lfg-graph" data-pitch="kifuku"', 'data-action="audio"', 'data-action="note"', 'id="c0" data-action="card" data-index="0" data-state="add"', 'class="lfg-pitch-tag" data-pitch="kifuku">起伏 <b>2</b>', '<span class="lfg-freq-name">JPDB</span><span class="lfg-freq-value">198</span>', 'class="lfg-dict" data-dictionary="JMdict"', '<span class="lfg-tag">v1</span>']) {
    assert.ok(html.includes(part), part);
  }
  // A sense's number isn't a tag.
  assert.ok(!html.includes('<span class="lfg-tag">1</span>'));
  const bare = body(eat);
  assert.ok(!bare.includes("data-action"));
  assert.ok(!body(eat, { index: 0, card: false }).includes("lfg-card"));
  assert.equal((listBody([eat, toEntry(results[1])]).match(/<section class="lfg-entry"/g) ?? []).length, 2);
});

test("a glossary is laid out as Yomitan's structured content, and nothing of it is markup", () => {
  assert.equal(glossary('["to eat"]', "D"), '<span class="gloss-text">to eat</span>');
  assert.equal(glossary('["a","b"]', "D"), '<ul class="gloss-list"><li>a</li><li>b</li></ul>');
  assert.equal(glossary("not json <b>", "D"), "not json &lt;b&gt;");
  const rich = glossary(JSON.stringify([{ type: "structured-content", content: { tag: "span", data: { content: "x", "a\"b": "c" }, style: { fontWeight: 700, marginTop: 1, color: "red;}", fontSize: "1.2em" }, lang: "ja", content: ["<script>", { tag: "script", content: "alert(1)" }, { tag: "a", href: "?query=x", content: "link" }, { tag: "br" }] } }]), "D");
  assert.equal(rich, '<span class="gloss-sc-span" data-sc-content="x" data-sc-ab="c" style="font-weight:700;margin-top:1em;font-size:1.2em" lang="ja">&lt;script&gt;alert(1)<a class="gloss-sc-a" data-href="?query=x">link</a><br></span>');
  // A picture is shown only where the host gives it a URL.
  const picture = JSON.stringify([{ type: "image", path: "a b/c.png", width: 10, height: 2, sizeUnits: "em", alt: 'a "pic"' }]);
  assert.equal(glossary(picture, "D"), "");
  assert.equal(glossary(picture, "D", (d, p) => `/m/${d}/${p}`), '<img class="gloss-image" src="/m/D/a b/c.png" style="width:10em;height:2em" alt="a &quot;pic&quot;">');
});

test("a dictionary's stylesheet reaches only its own entries", () => {
  assert.equal(scope("a,b{color:red}/* c */@font-face{x:y}@media (min-width:1px){i{top:0}}", 'My "Dict"'), '[data-dictionary="My \\"Dict\\""] a,[data-dictionary="My \\"Dict\\""] b{color:red}@media (min-width:1px){[data-dictionary="My \\"Dict\\""] i{top:0}}');
  assert.equal(scope("a{b:c}</style>", "D"), '[data-dictionary="D"] a{b:c}');
});

test("the colours are LFG's, and the page's styles are the host's", () => {
  assert.equal(paletteOf().accent, "#ff85b8");
  assert.equal(paletteOf({ theme: "light", scheme: "teal" }).accent, "#0b7a70");
  assert.equal(paletteOf({ scheme: "nope", colors: { bg: "#123" } }).bg, "#123");
  assert.ok(colours(paletteOf()).startsWith(":host{color-scheme:dark;--bg:#000000;"));
  assert.ok(!colours(paletteOf({ colors: { bg: "red}x{" } })).includes("}x{"));
  const css = hostCss();
  assert.ok(css.startsWith(":host{display:block;") && css.includes("\n.lfg-list{margin:0;") && !/^(html|body)\{/m.test(css));
});
