import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { JSDOM } from "jsdom";

// Hachidori's popup is written for a browser: give it one before it's loaded.
const dom = new JSDOM("<!doctype html><html><body><div id='here'></div></body></html>", { pretendToBeVisual: true });
for (const name of ["window", "document", "navigator", "Element", "Node", "NodeFilter", "HTMLElement", "ShadowRoot", "CSS", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"]) {
  if (!(name in globalThis) || name === "navigator") Object.defineProperty(globalThis, name, { value: dom.window[name], configurable: true, writable: true });
}
const { createDictionaryPopup, toHachidori, CARD_STATES, THEMES, HDPopup, HDGlossary } = await import("../src/index.js");
const { results, more, dictionaries } = await import("../example/sample.js");

const settle = () => new Promise((done) => setTimeout(done, 60));

function make(options = {}) {
  const container = dom.window.document.createElement("div");
  dom.window.document.body.append(container);
  const popup = createDictionaryPopup(container, options);
  return { popup, root: popup.element.shadowRoot, all: (selector) => [...popup.element.shadowRoot.querySelectorAll(selector)] };
}

test("it is Hachidori's popup, at the commit source.json names", () => {
  const source = JSON.parse(readFileSync(new URL("../src/hachidori/source.json", import.meta.url), "utf8"));
  assert.match(source.commit, /^[0-9a-f]{40}$/);
  assert.equal(typeof HDPopup.createPopupView, "function");
  assert.equal(typeof HDGlossary.appendTextOnlyGlossary, "function");
  for (const file of Object.keys(source.files)) {
    assert.ok(readFileSync(new URL(`../src/hachidori/${file}`, import.meta.url), "utf8").includes(source.commit.slice(0, 12)), file);
  }
});

test("a result takes Hoshidicts', Telly's and LFG's spellings", () => {
  const made = toHachidori({
    matched: "食べた",
    process: [{ name: "past" }],
    term: {
      expression: "食べる",
      glossaries: [{ dictName: "A", glossary: "[]" }],
      frequencies: [{ dictName: "F", values: [{ value: 3, display: "3rd" }] }],
      pitches: [{ dictName: "P", pitchPositions: [2] }],
    },
  });
  assert.deepEqual(made.trace, [{ name: "past", description: "" }]);
  assert.equal(made.deinflected, "食べる");
  assert.equal(made.term.glossaries[0].dictionary, "A");
  assert.deepEqual(made.term.frequencies[0].frequencies, [{ value: 3, display: "3rd", displayValue: "3rd" }]);
  assert.deepEqual(made.term.pitches[0], { dictName: "P", pitchPositions: [2], dictionary: "P", transcriptions: [], pitches: [{ position: 2, pattern: "", nasal: [], devoice: [] }] });
});

test("an entry has its headword, reading, pitch, frequencies, inflections and each dictionary's definitions", async () => {
  const { popup, root, all } = make({ dictionaries });
  // Not their styles: jsdom has no constructed stylesheets to scope them with. A browser does (the example).
  popup.render(results);
  await settle();
  assert.equal(root.querySelector(".gsm-hoshidicts-popup").hidden, false);
  assert.deepEqual(all(".gsm-hoshidicts-entry").map((entry) => entry.dataset.expression), ["食べる", "食"]);
  const headword = root.querySelector(".gsm-hoshidicts-primary-header .gsm-hoshidicts-expression");
  assert.equal(headword.getAttribute("aria-label"), "食べる, たべる");
  assert.equal(headword.querySelector("rt").textContent, "た");
  assert.equal(headword.querySelector(".gsm-hoshidicts-pitch-reading").textContent, "たべる");
  assert.equal(root.querySelector(".gsm-hoshidicts-deinflection-path").textContent, "食べられなかった → 食べる");
  assert.deepEqual(all(".gsm-hoshidicts-deinflection-step-name").map((step) => step.textContent), ["potential or passive", "negative", "past"]);
  const first = all(".gsm-hoshidicts-entry")[0];
  assert.deepEqual([...first.querySelectorAll(".gsm-hoshidicts-glossary-content")].map((content) => content.dataset.hoshidictsDictionary), ["Sample dictionary", "Sample plain dictionary [2026-01-01]"]);
  // A dictionary's name loses its date, as in Hachidori.
  assert.deepEqual([...first.querySelectorAll(".gsm-hoshidicts-dictionary-tag")].map((name) => name.textContent), ["Sample dictionary", "Sample plain dictionary"]);
  assert.ok(first.querySelector('.gsm-hoshidicts-glossary-content [data-sc-content="example-sentence"]'));
  assert.ok(first.textContent.includes("to live on (e.g. a salary)"));
  assert.ok(first.textContent.includes("198"));
  assert.ok(first.textContent.includes("72,949"));
  assert.ok(first.querySelector(".pronunciation-group-list"));
  popup.destroy();
});

test("nothing a dictionary writes becomes script", async () => {
  const { popup, root } = make();
  const glossary = JSON.stringify([{ type: "structured-content", content: [{ tag: "script", content: "window.bad = 1" }, { tag: "a", href: "javascript:window.bad=1", content: "x" }, { tag: "div", onclick: "window.bad=1", content: "<img src=x onerror=window.bad=1>" }] }]);
  popup.render([{ matched: "x", term: { expression: "x", glossaries: [{ dictionary: "D", glossary }] } }]);
  await settle();
  assert.equal(root.querySelector("script"), null);
  assert.equal(root.querySelector(".gsm-hoshidicts-glossary-content img"), null);
  assert.equal(root.querySelector("[onclick]"), null);
  assert.ok(![...root.querySelectorAll("a")].some((a) => /^javascript:/i.test(a.getAttribute("href") ?? "")));
  popup.destroy();
});

test("the Anki button is there when the host adds cards, and says its state", async () => {
  const pressed = [];
  const { popup, all } = make({ onAddCard: (result, index) => pressed.push(["add", result.term.expression, index]), onOpenCard: (result, index) => pressed.push(["open", result.term.expression, index]) });
  popup.render(results, { added: ["食"] });
  await settle();
  const buttons = () => all(".gsm-hoshidicts-mine-button");
  assert.deepEqual(buttons().map((b) => [b.dataset.resultIndex, b.dataset.state, b.querySelector(".hd-icon").dataset.icon]), [["0", "ready", "add"], ["1", "success", "book-search"]]);
  buttons()[0].click();
  buttons()[1].click();
  assert.deepEqual(pressed, [["add", "食べる", 0], ["open", "食", 1]]);
  popup.setCardState(0, "adding");
  assert.equal(buttons()[0].dataset.state, CARD_STATES.adding.state);
  assert.equal(buttons()[0].disabled, true);
  buttons()[0].click();
  assert.equal(pressed.length, 2);
  popup.setCardState(0, "error", "Anki isn't open");
  assert.equal(buttons()[0].title, "Anki isn't open");
  assert.equal(buttons()[0].disabled, false);
  popup.setAdded(["食べる"]);
  assert.equal(buttons()[0].dataset.state, "success");
  popup.destroy();

  const plain = make();
  plain.popup.render(results);
  await settle();
  assert.equal(plain.all(".gsm-hoshidicts-mine-button").length, 0);
  assert.equal(plain.popup.element.dataset.hoshidictsAudioButton, "hidden");
  assert.equal(plain.popup.element.dataset.hoshidictsNoteButton, "hidden");
  plain.popup.destroy();
});

test("the audio button plays the word it's beside", async () => {
  const played = [];
  const { popup, all } = make({ onPlayAudio: (result, index) => played.push([result.term.expression, index]), hasAudio: (result) => result.term.expression !== "食" });
  popup.render(results);
  await settle();
  assert.equal(popup.element.dataset.hoshidictsAudioButton, undefined);
  const buttons = all(".gsm-hoshidicts-audio-button");
  assert.equal(buttons.length, 2);
  buttons[0].click();
  assert.deepEqual(played, [["食べる", 0]]);
  assert.equal(buttons[1].closest(".gsm-hoshidicts-audio-control").hidden, true);
  popup.destroy();
});

test("a link to another entry is looked up in place, and Back returns", async () => {
  const asked = [];
  const { popup, root } = make({
    lookup: async (text) => {
      asked.push(text);
      return more.filter((result) => text.startsWith(result.term.expression));
    },
  });
  popup.render(results);
  await settle();
  assert.equal(root.querySelector(".gsm-hoshidicts-kanji-back"), null);
  root.querySelector('a[data-hoshidicts-query="景色"]').click();
  await settle();
  assert.deepEqual(asked, ["景色"]);
  assert.equal(root.querySelector(".gsm-hoshidicts-primary-header .gsm-hoshidicts-expression").getAttribute("aria-label"), "景色, けしき");
  root.querySelector(".gsm-hoshidicts-kanji-back").click();
  await settle();
  assert.equal(root.querySelector(".gsm-hoshidicts-primary-header .gsm-hoshidicts-expression").getAttribute("aria-label"), "食べる, たべる");
  assert.equal(root.querySelector(".gsm-hoshidicts-kanji-back"), null);
  assert.equal(popup.back(), false);
  // A kanji of the headword is looked up the same way.
  root.querySelector(".gsm-hoshidicts-kanji-link").click();
  await settle();
  assert.equal(asked.at(-1), "食");
  popup.destroy();
});

test("without results it's hidden, and a notice is Hachidori's", async () => {
  const { popup, root } = make();
  popup.render(results);
  await settle();
  popup.render([]);
  assert.equal(root.querySelector(".gsm-hoshidicts-popup").hidden, true);
  assert.equal(root.querySelectorAll(".gsm-hoshidicts-entry").length, 0);
  popup.notice("No word starts here.");
  assert.equal(root.querySelector(".gsm-hoshidicts-popup").hidden, false);
  assert.ok(root.querySelector(".gsm-hoshidicts-popup").textContent.includes("No word starts here."));
  popup.clear();
  assert.equal(root.querySelector(".gsm-hoshidicts-popup").hidden, true);
  popup.destroy();
  assert.equal(popup.element.isConnected, false);
});

test("the theme is one of Hachidori's palettes", () => {
  const { popup } = make({ theme: "light" });
  assert.equal(popup.element.dataset.hoshidictsTheme, "light");
  popup.setTheme({ theme: "nonsense" });
  assert.equal(popup.element.dataset.hoshidictsTheme, "default");
  assert.ok(THEMES.includes("default") && THEMES.includes("high-contrast"));
  popup.setTheme({ css: ".x{}", display: { showPitchAccentColors: true } });
  assert.equal(popup.element.dataset.hoshidictsPitchColors, "on");
  popup.destroy();
});
