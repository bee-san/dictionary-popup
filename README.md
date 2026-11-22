# dictionary-popup

The dictionary popup from [Hachidori](https://github.com/bee-san/hachidori), for any web page: a looked-up word with its reading over it and its pitch drawn on the reading, small buttons to add its card and hear it, how common it is, its pitch accents, the inflections undone to find it, then each dictionary's definitions in that dictionary's own styles. Tap a word in a definition and it's looked up in place, with Back to return.

![The popup](docs/popup.png)

It is Hachidori's popup, not a copy of how it looks: Hachidori's own renderer and stylesheet are in `src/hachidori` as they are in the extension, and this package is the little a page needs to use them without the extension around them. It shows what [Hoshidicts](https://github.com/bee-san/hoshidicts) finds (through its C interface, its wasm build or JNI), and anything else you put in the same shape. It doesn't look words up or talk to Anki itself: you give it results, and it tells you when a button is pressed.

## Install

```sh
npm install github:bee-san/dictionary-popup
```

There's nothing to build and nothing it depends on.

npm 12 and later refuse packages from git unless the project allows them (`EALLOWGIT`). Put `allow-git=root` in the project's `.npmrc`, which lets the project's own dependencies come from git and nothing deeper, or copy `src/` into the project instead.

## Use

```js
import { createDictionaryPopup } from "dictionary-popup";

const popup = createDictionaryPopup(document.getElementById("popup"), {
  onAddCard(result, index) {
    popup.setCardState(index, "adding");
    addToAnki(result).then(() => popup.setCardState(index, "in-anki"));
  },
  onPlayAudio: (result) => play(result.term.expression, result.term.reading),
  lookup: (text) => lookUp(text), // a word tapped in a definition
});

popup.render(results, { styles, added: ["景色"] });
```

The popup is one element (`popup.element`, class `dictionary-popup`) with a shadow root, so its styles and your page's never meet. It's as wide as you make that element and as tall as its entries; give the element a `max-height` and the definitions scroll under the headword, which stays put and changes to the entry you've scrolled to. Its background is 85% solid, as Hachidori's is over a page, and it draws its own border and shadow.

Hachidori's scripts are classic scripts that find each other on `globalThis`, so importing this sets `HDPopup`, `HDGlossary` and `HDExternalLinks` there.

## Results

`render(results, options)` takes an array of these (`src/index.d.ts` has the types):

```js
{
  matched: "食べられなかった",          // the text it was found as
  deinflected: "食べる",
  trace: [{ name: "past", description: "did" }, { name: "negative" }],   // or `process`
  term: {
    expression: "食べる",
    reading: "たべる",
    rules: "v1 vt",
    glossaries: [{ dictionary: "JMdict", glossary: "[\"to eat\"]", definitionTags: "v1 vt" }],
    frequencies: [{ dictionary: "JPDB", frequencies: [{ value: 198, displayValue: "198" }] }],
    pitches: [{ dictionary: "NHK", pitches: [{ position: 2 }] }],
  },
}
```

A glossary is what a Yomitan dictionary holds: structured content as JSON, or a JSON array of strings. A glossary may also carry `tags`, its definition tags as the dictionary's tag bank has them (`[{ name, category, notes }]`), which gives each tag its colour and what it stands for; without them the names in `definitionTags` are shown plain. Hachidori builds every element itself from the tags, attributes and style properties Yomitan allows, so nothing a dictionary writes becomes script.

## API

`createDictionaryPopup(container, options)` returns the popup.

| Option | |
|---|---|
| `theme` | One of Hachidori's palettes (`THEMES`): `"default"` (Hachidori's own, dark), `"auto"` (the system's light or dark), `"light"`, `"dark"`, `"catppuccin-mocha"`, `"high-contrast"` and the rest. |
| `opacity` | How solid the background is, 0 to 100 (default 85). |
| `display` | Hachidori's Design settings for an entry, by its own names, over `DEFAULT_DISPLAY`: `showFrequencyDictionaryNames`, `averageFrequency`, `compactFrequencyNumbers`, `showPitchAccentFurigana`, `showPitchAccentGraph`, `showPitchAccentColors`, `hidePopupGrammarTags`, `glossaryLayoutMode`, `popupColumns` and the others. |
| `dictionaries` | What Hachidori knows of each dictionary, `[{ title, displayName, frequencyMode, favorite }]`: a name to show for it, whether its frequencies are ranks or counts, and whether it has a tab of its own. |
| `tabGroups` | Dictionaries that share a tab, `[{ id, name, dictionaries: [title] }]`. |
| `css` | Extra CSS for the popup. |
| `initialResultCount` | How many results are drawn at once; the rest follow as the page is idle (default 1). |
| `onAddCard(result, index)` | The Anki button of a word not added yet. Without it there's no Anki button. |
| `onOpenCard(result, index)` | The Anki button of a word that's in Anki. |
| `onPlayAudio(result, index)` | The audio button. Without it there's no audio button. |
| `hasAudio(result)` | Whether a word has audio to play (default: every word). |
| `lookup(text)` | Looks up the words `text` starts with, for a word tapped in a definition, a link to another entry and a kanji of the headword: results, or `{ results, styles, states, added }`, or a promise of either. Without it definitions aren't looked up. |
| `media(dictionary, path)` | A dictionary's picture: a URL, a Blob, or a promise of either. Without it pictures are left out. |
| `onExternalLink(url)` | A link out of a definition (default: opens it in a new tab). |
| `onClose()` | A close button at the top of the popup. Without it there's none. |

| The popup | |
|---|---|
| `render(results, { styles, states, added })` | Shows results. `styles` is each dictionary's CSS (`[{ dictionary, styles }]`), limited to its entries; `states` each result's card state; `added` the expressions already in Anki. With no results the popup is hidden. |
| `notice(message)` | Shows a sentence in place of entries, as Hachidori says "No definition found." |
| `setCardState(index, state, message)` | `"add"` (**+**), `"adding"`, `"in-anki"`, `"duplicate"` (in Anki, and can be added again), `"waiting"` (Anki hasn't answered yet), `"error"` or `"unavailable"`. `message` is what the button says of it. |
| `setAdded(expressions)` | Marks those words as in Anki. |
| `setCurrent(index)` | Moves to an entry, as Hachidori's next and previous entry keys do. |
| `back()` | Goes back from a word looked up in a definition. |
| `setTheme({ theme, opacity, display, dictionaries, tabGroups, css })` | Changes how it looks. |
| `clear()` | Empties it, and hides it. |
| `destroy()` | Takes it out of the page. |
| `element` | The popup's element. |

Hachidori's own modules are exported too, for a host that wants more of them: `HDPopup` (`render/popup.js`), `HDGlossary` (`render/glossary.js`), `READER_CSS`, `ICONS_CSS`, and `toHachidori`, which makes a result what they read.

## What's in it, and what isn't

Everything a reader needs to read an entry and add a card is Hachidori's: the headword with furigana and pitch, the pinned header that follows the entry you've scrolled to, frequency and pitch badges, the deinflection chain, definition tags in Yomitan's colours, dictionary names without their dates, tabs for favourite dictionaries and groups, structured content with tables, pictures and links, each dictionary's stylesheet kept to its own entries, the compact layout, columns, its palettes, and the Anki button's states with Hachidori's icons.

Left out, because they need the rest of the extension: its settings pages, profiles and languages other than Japanese, the Note editor (your own dictionary), custom buttons and links, user scripts, the audio button's list of sources, lookup counts and definition blur, the kanji dictionary's own view (a kanji is looked up as a word), the enlarged picture on hover, resizing by dragging, and the highlight on the word in the page. Hachidori's other themes with renderers of their own (JL, Nazeka, Plain, Bee's Theme, Crystal) aren't here either: this is the Default one.

Different, because a page isn't the extension: the popup sits in your element instead of floating beside the word, and a word in a definition replaces what's shown (with Back) instead of opening a second popup over the first.

## Older browsers

Hachidori is written for a current Chrome. Its stylesheet uses `color-mix()` and `oklch()` (Chrome 111), `light-dark()` (123) and the unprefixed `mask` (120), and dictionaries' own stylesheets use those and nested rules (120): Jitendex does. An Android WebView that was never updated is older than all of them (Android 13 ships WebView 109), and there the popup would have no backgrounds, no icons and no tag colours, and Jitendex no layout.

So on a browser without them, and only there, `src/legacy.js` works out each colour the browser can't and hands it over as a plain `rgba()`, for whichever palette is chosen; gives `mask` its `-webkit-` twin; writes a dictionary's nested rules out one by one; and finds the character under a tap in a definition without `caretPositionFromPoint`'s shadow roots (Chrome 128). Hachidori's files stay as they are. In Chromium 109 the popup is then drawn as a current Chromium draws it.

What it can't do there: a colour mixed with `currentColor`, which is left as the dictionary wrote it (and so dropped), and the tint behind a pitch dictionary's name when `showPitchAccentColors` is on, which stays the palette's.

## Try it

```sh
python3 -m http.server 8799
# http://127.0.0.1:8799/example/
# ?theme=light for another palette, &added for a word that's in Anki, &noaudio for no audio button
```

`npm test` runs the popup in jsdom, which has no constructed stylesheets: a dictionary's own styles are only seen in a browser. To see it as an old WebView does, open the example in Chromium 109 (the one `npx playwright@1.29 install chromium` fetches).

## Keeping in step with Hachidori

`src/hachidori` is written by a script and never edited by hand. `src/hachidori/source.json` names the Hachidori commit it matches (now `5a5b5e2`) and which file is which:

| Here | In Hachidori |
|---|---|
| `src/hachidori/popup.js` | `extension/render/popup.js` |
| `src/hachidori/glossary.js` | `extension/render/glossary.js` |
| `src/hachidori/external-links.js` | `extension/external-links.js` |
| `src/hachidori/reader-css.js` | `extension/render/reader.css` |
| `src/hachidori/icons-css.js` | `extension/icons.css` |

```sh
node scripts/sync-from-hachidori.mjs ../hachidori   # origin/main, read from git; or name another ref
npm test
```

What isn't Hachidori's is `src/index.js`, which does for the popup what the extension's content script does (`content.js`, `anki-content.js`: the shadow root, the Anki button, lookups from definitions), `src/embed-css.js`, the few rules that let the popup sit in a page's element, and `src/legacy.js`, for older browsers. After a sync, look at the popup in an old Chromium too: a newer CSS feature in Hachidori's stylesheet shows there first. When Hachidori changes what `createPopupView` is given or hands back, that's where to follow it.

## License

GPL-3.0-or-later, as Hachidori is. `src/hachidori/ATTRIBUTION.md` says whose work the popup builds on (GameSentenceMiner, Hoshi Reader, Yomitan, Hoshidicts), and the icons are Microsoft's Fluent System Icons (MIT, `src/hachidori/LICENSE.fluent-icons`).
