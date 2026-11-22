// A lookup of 景色を, as Hoshidicts gives it.
export const styles = [{ dictionary: "JMdict", styles: '[data-sc-content="example-sentence"] { color: #8ab4f8; } ul[data-sc-content="examples"] { list-style: none; padding-left: 0; font-size: .9em; }' }];

export const results = [
  {
    matched: "食べられなかった",
    deinflected: "食べる",
    trace: [{ name: "past" }, { name: "negative" }, { name: "potential or passive" }],
    term: {
      expression: "食べる",
      reading: "たべる",
      rules: "v1 vt",
      glossaries: [
        {
          dictionary: "JMdict",
          definitionTags: "1 v1 vt",
          termTags: "news",
          glossary: JSON.stringify([
            {
              type: "structured-content",
              content: [
                { tag: "ul", data: { content: "glossary" }, content: [{ tag: "li", content: "to eat" }] },
                {
                  tag: "ul",
                  data: { content: "examples" },
                  content: [
                    { tag: "li", data: { content: "example-sentence" }, lang: "ja", content: "もっと果物を食べるべきです。" },
                    { tag: "li", content: "You should eat more fruit." },
                  ],
                },
              ],
            },
          ]),
        },
        { dictionary: "JMdict", definitionTags: "2 v1 vt", termTags: "", glossary: JSON.stringify(["to live on (e.g. a salary)", "to live off", "to subsist on"]) },
        { dictionary: "大辞林", definitionTags: "動バ下一", termTags: "", glossary: JSON.stringify(["食物を口に入れ、かんで飲みこむ。", "暮らしを立てる。生活する。"]) },
      ],
      frequencies: [
        { dictionary: "JPDB_v2.2_Frequency_Kana", frequencies: [{ value: 198, displayValue: "198" }] },
        { dictionary: "BCCWJ", frequencies: [{ value: 412, displayValue: "412" }] },
      ],
      pitches: [{ dictionary: "NHK", pitches: [{ position: 2 }] }],
    },
  },
  {
    matched: "景色",
    deinflected: "景色",
    term: {
      expression: "景色",
      reading: "けしき",
      rules: "n",
      glossaries: [{ dictionary: "JMdict", definitionTags: "1 n", termTags: "", glossary: JSON.stringify(["scenery", "scene", "landscape"]) }],
      frequencies: [{ dictionary: "JPDB_v2.2_Frequency_Kana", frequencies: [{ value: 2014, displayValue: "2014" }] }],
      pitches: [{ dictionary: "NHK", pitches: [{ position: 1 }] }],
    },
  },
];
