import type { languages } from "monaco-editor";

const brackets: languages.IMonarchLanguageBracket[] = [
  { open: "{", close: "}", token: "delimiter.curly" },
  { open: "[", close: "]", token: "delimiter.square" },
  { open: "(", close: ")", token: "delimiter.parenthesis" },
];

const luauLanguage: languages.IMonarchLanguage = {
  defaultToken: "",

  keywords: [
    "and", "break", "do", "else", "elseif", "end", "for", "function",
    "if", "in", "local", "not", "or", "repeat", "return", "then",
    "until", "while", "continue",
  ],

  luauKeywords: [
    "const", "type", "export",
  ],

  typeKeywords: [
    "string", "number", "boolean", "thread", "vector", "buffer",
    "unknown", "never", "any", "nil",
  ],

  brackets,

  tokenizer: {
    root: [
      { include: "@whitespace" },

      [/^#!.*$/, "comment.line.shebang"],

      [/---/, { token: "comment.line.double-dash.documentation", next: "@docComment" }],
      [/--\[(=*)\[/, { token: "comment.block", next: "@blockComment.$1" }],
      [/--.*$/, "comment.line.double-dash"],

      [/"([^"\\]|\\.)*"/, "string.quoted.double"],
      [/'([^'\\]|\\.)*'/, "string.quoted.single"],
      [/\[(=*)\[/, { token: "string.other.multiline", next: "@multilineString.$1" }],
      [/`/, { token: "string.interpolated", next: "@interpolatedString" }],

      [/0[xX][\da-fA-F_]+/, "number.hex"],
      [/0[bB][01_]+/, "number.binary"],
      [/\d[\d_]*(\.[\d_]*)?([eE][+-]?\d[\d_]*)?/, "number"],

      [/@[a-zA-Z_]\w*/, "meta.attribute"],

      [/::/, "keyword.operator.typecast"],
      [/->/, "keyword.operator.type.function"],
      [/[?|&]/, "keyword.operator.type"],
      [/[=!<>]=|[+\-*/%^#]|\.{2}(?!\.)/, "keyword.operator"],

      [/,/, "delimiter.comma"],
      [/[{}()\[\]]/, "@brackets"],

      [/\.{3}/, "keyword.other.unit"],

      [
        /[a-zA-Z_]\w*/,
        {
          cases: {
            "@keywords": "keyword.control",
            "@luauKeywords": "keyword.control.luau",
            "@typeKeywords": "support.type.primitive",
            "@default": "identifier",
          },
        },
      ],
    ],

    whitespace: [
      [/[ \t\r\n]+/, "white"],
    ],

    blockComment: [
      [/\](=*)\]/, { token: "comment.block", next: "@pop" }],
      [/./, "comment.block"],
    ],

    docComment: [
      [/\](=*)\]/, { token: "comment.block", next: "@pop" }],
      [/@\w+/, "storage.type.class.luadoc"],
      [/\n/, { token: "comment.line.double-dash.documentation", next: "@pop" }],
      [/./, "comment.line.double-dash.documentation"],
    ],

    multilineString: [
      [/\](=*)\]/, { token: "string.other.multiline", next: "@pop" }],
      [/./, "string.other.multiline"],
    ],

    interpolatedString: [
      [/`/, { token: "string.interpolated", next: "@pop" }],
      [/\{/, { token: "delimiter.bracket", next: "@interpolation" }],
      [/[^`{]+/, "string.interpolated"],
      [/./, "string.interpolated"],
    ],

    interpolation: [
      [/\}/, { token: "delimiter.bracket", next: "@pop" }],
      { include: "@root" },
    ],


  },
};

export function registerLuauLanguage(monaco: typeof import("monaco-editor")) {
  monaco.languages.register({ id: "luau" });
  monaco.languages.setMonarchTokensProvider("luau", luauLanguage);
  monaco.languages.setLanguageConfiguration("luau", {
    comments: {
      lineComment: "--",
      blockComment: ["--[[", "]]"],
    },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"', notIn: ["string"] },
      { open: "'", close: "'", notIn: ["string"] },
      { open: "`", close: "`", notIn: ["string", "comment"] },
      { open: "--[[", close: "]]", notIn: ["string", "comment"] },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: "`", close: "`" },
    ],
  });
}
