// A lookup of 食べられなかった, as Hoshidicts gives it.
export const styles = [{ dictName: "JMdict", styles: '[data-sc-content="example-sentence"] { color: #8ab4f8; }' }];

export const results = [
  {
    matched: "食べられなかった",
    deinflected: "食べる",
    trace: [
      { name: "-た", description: "past" },
      { name: "negative", description: "not" },
      { name: "potential or passive", description: "can, or is done to" },
    ],
    term: {
      expression: "食べる",
      reading: "たべる",
      rules: "v1 vt",
      glossaries: [
        {
          dictionary: "JMdict",
          definitionTags: "1 v1 vt",
          termTags: "⭐ news",
          glossary: JSON.stringify([
            {
              type: "structured-content",
              content: [
                { tag: "ul", data: { content: "glossary" }, content: [{ tag: "li", content: "to eat" }] },
                {
                  tag: "ul",
                  data: { content: "examples" },
                  content: [
                    { tag: "li", data: { content: "example-sentence" }, content: "もっと果物を食べるべきです。" },
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
        { dictionary: "JPDB", frequencies: [{ value: 198, displayValue: "198" }] },
        { dictionary: "BCCWJ", frequencies: [{ value: 412, displayValue: "412" }] },
      ],
      pitches: [{ dictionary: "NHK", pitches: [{ position: 2, nasal: [], devoice: [] }] }],
    },
  },
  {
    matched: "食",
    deinflected: "食",
    term: {
      expression: "食",
      reading: "しょく",
      rules: "n",
      glossaries: [{ dictionary: "JMdict", definitionTags: "1 n", termTags: "", glossary: JSON.stringify(["food", "foodstuff"]) }],
      frequencies: [{ dictionary: "JPDB", frequencies: [{ value: 2931, displayValue: "2931" }] }],
      pitches: [{ dictionary: "NHK", pitches: [{ position: 0 }] }],
    },
  },
];
