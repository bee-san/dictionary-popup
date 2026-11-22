// What Hoshidicts gives for a tapped 食べられなかった, written by hand in the
// shape real dictionaries have: a dictionary with structured content and its
// own stylesheet (as Jitendex is laid out), one with plain definitions,
// frequencies as ranks and as counts, and pitch accents.
const tag = (name, category, notes, order = 0) => ({ name, category, order, score: 0, notes });

const ruby = (text, reading) => ({ tag: "ruby", content: [text, { tag: "rt", content: reading }] });
const example = (japanese, english) => ({
  tag: "div",
  data: { content: "example-sentence" },
  content: [
    { tag: "div", data: { content: "example-sentence-a" }, lang: "ja", content: japanese },
    { tag: "div", data: { content: "example-sentence-b" }, content: english },
  ],
});
const sense = (glosses, ...rest) => ({
  tag: "li",
  data: { content: "sense" },
  content: [{ tag: "ul", data: { content: "glossary" }, content: glosses.map((g) => ({ tag: "li", content: g })) }, ...rest],
});
const structured = (...senses) => JSON.stringify([{ type: "structured-content", content: [{ tag: "ol", data: { content: "sense-groups" }, content: senses }] }]);

export const styles = [
  {
    dictionary: "Sample dictionary",
    styles: `
      ol[data-sc-content="sense-groups"] { padding-left: 1.4em; }
      ul[data-sc-content="glossary"] { list-style: none; padding-left: 0; }
      div[data-sc-content="example-sentence"] { margin: 0.4em 0; padding: 0.3em 0.6em; border-left: 3px solid var(--text-color-light2, #888); border-radius: 0.3em; background: color-mix(in srgb, var(--text-color, #888) 6%, transparent); }
      div[data-sc-content="example-sentence-a"] { font-size: 1.2em; }
      div[data-sc-content="example-sentence-b"] { font-size: 0.85em; opacity: 0.85; }
      span[data-sc-content="keyword"] { color: light-dark(#187a2f, #71e386); }
      a[data-sc-content="see-also"] { font-size: 0.85em; }
    `,
  },
];

const keyword = (content) => ({ tag: "span", data: { content: "keyword" }, content });

export const results = [
  {
    matched: "食べられなかった",
    deinflected: "食べる",
    trace: [
      { name: "potential or passive", description: "can do, or is done to" },
      { name: "negative", description: "not" },
      { name: "past", description: "did" },
    ],
    term: {
      expression: "食べる",
      reading: "たべる",
      rules: "v1",
      glossaries: [
        {
          dictionary: "Sample dictionary",
          definitionTags: "v1 vt",
          termTags: "",
          tags: [tag("★", "popular", "high priority entry", -1), tag("v1", "partOfSpeech", "Ichidan verb"), tag("vt", "partOfSpeech", "transitive verb", 1)],
          glossary: structured(
            sense(["to eat"], example(["もっと", ruby("野菜", "やさい"), "を", keyword([ruby("食", "た"), "べる"]), "ほうがいい。"], "You should eat more vegetables.")),
            sense(
              ["to live on (e.g. a salary)", "to live off"],
              example([ruby("絵", "え"), "だけでは", keyword([ruby("食", "た"), "べて"]), "いけない。"], "You can't live on painting alone."),
              { tag: "a", data: { content: "see-also" }, href: "?query=景色&wildcards=off", content: "See also: 景色" },
            ),
          ),
        },
        {
          dictionary: "Sample plain dictionary [2026-01-01]",
          definitionTags: "v1 vt",
          termTags: "",
          glossary: JSON.stringify(["to eat", "to live on (e.g. a salary); to live off; to subsist on"]),
        },
      ],
      frequencies: [
        { dictionary: "Sample ranks", frequencies: [{ value: 198, displayValue: "198" }] },
        { dictionary: "Sample novels", frequencies: [{ value: 342, displayValue: "342" }] },
        { dictionary: "Sample corpus", frequencies: [{ value: 72949, displayValue: "72,949" }] },
      ],
      pitches: [{ dictionary: "Sample pitch", pitches: [{ position: 2, pattern: "", nasal: [], devoice: [] }] }],
    },
  },
  {
    matched: "食",
    deinflected: "食",
    trace: [],
    term: {
      expression: "食",
      reading: "しょく",
      rules: "n",
      glossaries: [
        {
          dictionary: "Sample dictionary",
          definitionTags: "n",
          termTags: "",
          tags: [tag("n", "partOfSpeech", "noun")],
          glossary: structured(sense(["food", "meal"]), sense(["eclipse (of the sun or moon)"])),
        },
      ],
      frequencies: [{ dictionary: "Sample ranks", frequencies: [{ value: 2876, displayValue: "2876" }] }],
      pitches: [{ dictionary: "Sample pitch", pitches: [{ position: 0, pattern: "", nasal: [], devoice: [] }] }],
    },
  },
];

/** What a word tapped in a definition, or a link to another entry, finds. */
export const more = [
  {
    matched: "景色",
    deinflected: "景色",
    trace: [],
    term: {
      expression: "景色",
      reading: "けしき",
      rules: "n",
      glossaries: [
        {
          dictionary: "Sample dictionary",
          definitionTags: "n",
          termTags: "",
          tags: [tag("★", "popular", "high priority entry", -1), tag("n", "partOfSpeech", "noun")],
          glossary: structured(sense(["scenery", "scene", "landscape"], example(["ここからの", keyword(ruby("景色", "けしき")), "はきれいだ。"], "The view from here is beautiful."))),
        },
      ],
      frequencies: [{ dictionary: "Sample ranks", frequencies: [{ value: 1614, displayValue: "1614" }] }],
      pitches: [{ dictionary: "Sample pitch", pitches: [{ position: 1, pattern: "", nasal: [], devoice: [] }] }],
    },
  },
  {
    matched: "野菜",
    deinflected: "野菜",
    trace: [],
    term: {
      expression: "野菜",
      reading: "やさい",
      rules: "n",
      glossaries: [{ dictionary: "Sample plain dictionary [2026-01-01]", definitionTags: "n", termTags: "", glossary: JSON.stringify(["vegetable"]) }],
      frequencies: [{ dictionary: "Sample ranks", frequencies: [{ value: 2210, displayValue: "2210" }] }],
      pitches: [{ dictionary: "Sample pitch", pitches: [{ position: 0, pattern: "", nasal: [], devoice: [] }] }],
    },
  },
];

/** What Hachidori knows of each dictionary: a name to show, and whether its frequencies are ranks or counts. */
export const dictionaries = [
  { title: "Sample dictionary" },
  { title: "Sample plain dictionary [2026-01-01]" },
  { title: "Sample ranks", frequencyMode: "rank-based" },
  { title: "Sample novels", frequencyMode: "rank-based" },
  { title: "Sample corpus", frequencyMode: "occurrence-based" },
  { title: "Sample pitch" },
];
