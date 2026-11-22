# dictionary-popup

The dictionary popup from [LFG](https://github.com/bee-san/chimahon), for any web page or WebView: Yomitan-style entries with furigana headwords, tags, the inflections undone, frequencies, pitch accent, each dictionary's own styles, and a **+** that adds the word to Anki and turns into a green tick.

![The popup, dark](docs/popup-dark.png)

It shows what [Hoshidicts](https://github.com/bee-san/hoshidicts) finds (through its C interface, its wasm build or LFG's JNI), and anything else you put in the same shape. It doesn't look words up or talk to Anki itself: you give it results, and it tells you when **+** is pressed.

## Install

```sh
npm install github:bee-san/dictionary-popup
```

There's nothing to build and nothing it depends on.

## Use

```js
import { createDictionaryPopup } from "dictionary-popup";

const popup = createDictionaryPopup(document.getElementById("popup"), {
  theme: "dark",
  lang: "ja",
  onAddCard(result, { dictionary, selection }) {
    addToAnki(result).then(() => popup.setAdded([result.term.expression]));
  },
});

popup.render(results, { styles, added: ["食べる"] });
```

The popup is an iframe that fills `container`, so give the container a size. Its styles and your page's never meet.

### Under a Content Security Policy

By default the popup's page is written inline (`srcdoc`), which needs no files but is blocked where inline scripts are (Tauri's default, most extensions). There, serve the package's `popup/` folder from your own origin and say where it is:

```js
createDictionaryPopup(container, { src: "/dictionary-popup/index.html" });
```

Import it from `dictionary-popup/core` there, which is the same without the inline copy of the page (150 KB your bundle doesn't need).

`node_modules/dictionary-popup/popup/` holds `index.html`, `base.css`, `renderer.js` and `kanji-renderer.js`: copy the four of them into what your site serves. In an Android WebView you can load that `index.html` from your assets and drive `window.DictionaryRenderer` yourself, as LFG does.

## Results

`render(results, options)` takes an array of these (`src/index.d.ts` has the types):

```js
{
  matched: "食べられなかった",          // the text it was found as
  deinflected: "食べる",
  trace: [{ name: "-た", description: "past" }, { name: "negative" }],
  term: {
    expression: "食べる",
    reading: "たべる",
    rules: "v1 vt",
    glossaries: [{ dictionary: "JMdict", glossary: "[\"to eat\"]", definitionTags: "1 v1 vt", termTags: "news" }],
    frequencies: [{ dictionary: "JPDB", frequencies: [{ value: 198, displayValue: "198" }] }],
    pitches: [{ dictionary: "NHK", pitches: [{ position: 2 }] }],
  },
}
```

A glossary is what a Yomitan dictionary holds: structured content as JSON, or a JSON array of strings. LFG's own spellings (`dictName`, `process`, `pitchPositions`) are taken too.

## API

`createDictionaryPopup(container, options)` returns the popup.

| Option | |
|---|---|
| `src` | URL of the packaged `popup/index.html` on your origin. Without it the page is inline. |
| `theme` | `"light"` (default) or `"dark"`. |
| `colors` | `{ bg, fg, secondary, accent, onAccent, border, hoverBg, tabBg }`, over the theme's. |
| `fontSize` | In px (default 14). |
| `lang` | The entries' language, e.g. `"ja"`. |
| `css` | Extra CSS for the popup's page. |
| `onAddCard(result, { dictionary, selection })` | The **+** button. Without it there's no button. |
| `onOpenCard(result, { dictionary, selection })` | The book button of a word already added. Without it there's no button. |
| `onHeight(px)` | The height the entries need, whenever it changes, to size the container by. |
| `bridges` | Objects put on the popup's window as they are, for hosts that speak the renderer's own bridges (`WordAudioBridge` turns on the audio button). |

| The popup | |
|---|---|
| `render(results, { styles, added, placeholder, payload })` | Shows results. `styles` is each dictionary's CSS (`[{ dictionary, styles }]`), scoped to its entries; `added` the expressions already in Anki; `payload` anything else LFG's renderer takes (`showPitchDiagram`, `dictionaryCollapseMode`, `mediaDataUris`, …). |
| `setAdded(expressions)` | Turns the **+** of those words into a green tick. |
| `setTheme({ theme, colors, fontSize, lang })` | Changes how it looks. |
| `clear()` | Empties it. |
| `destroy()` | Takes it out of the page. |
| `ready` | A promise for the popup's page being up. |
| `iframe` | The iframe itself. |

`normalizeResult(result, index)` is the conversion `render` does, for hosts that drive the renderer themselves.

## Try it

```sh
python3 -m http.server 8799
# http://127.0.0.1:8799/example/            served as files
# http://127.0.0.1:8799/example/?inline     inline
# add theme=light for the light theme
```

## Where the popup comes from

`popup/base.css`, `popup/renderer.js` and `popup/kanji-renderer.js` are LFG's (`chimahon/src/main/assets/dictionary/` in [bee-san/chimahon](https://github.com/bee-san/chimahon)), copied as they are, and LFG is where they're developed. To bring in a newer copy:

```sh
node scripts/sync-from-lfg.mjs ../chimahon
npm run build    # writes src/inline.js from popup/
npm test
```

They were last copied at chimahon `a49044aee4`.

## License

GPL-3.0-or-later, as LFG is.
