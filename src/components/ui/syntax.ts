export type Token = { text: string; kind: TokenKind };
export type TokenKind = "plain" | "comment" | "string" | "number" | "keyword" | "prop" | "punct";

const KEYWORDS = new Set([
  "const",
  "let",
  "var",
  "function",
  "return",
  "if",
  "else",
  "for",
  "while",
  "await",
  "async",
  "new",
  "class",
  "extends",
  "import",
  "export",
  "from",
  "default",
  "try",
  "catch",
  "finally",
  "throw",
  "typeof",
  "instanceof",
  "of",
  "in",
  "null",
  "undefined",
  "true",
  "false",
  "this",
  "yield",
  "static",
  "get",
  "set",
  "as",
  "type",
  "interface",
  "void",
  "=>",
]);

const PATTERN = new RegExp(
  [
    "(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*|<!--[\\s\\S]*?-->|#[^\\n]*)", // comments
    "(\"(?:[^\"\\\\\\n]|\\\\.)*\"|'(?:[^'\\\\\\n]|\\\\.)*'|`(?:[^`\\\\]|\\\\.)*`)", // strings
    "(\\b\\d+(?:\\.\\d+)?(?:px|rem|em|s|ms|%|fr|vw|vh|dvw)?\\b)", // numbers with units
    "([A-Za-z_$][\\w$-]*)", // identifiers
  ].join("|"),
  "g",
);

/**
 * Deliberately small: a full highlighter would cost more bytes than the code it
 * colours. This recognises comments, strings, numbers and keywords, which is
 * enough to make a snippet readable.
 */
export function tokenize(code: string, lang: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;
  const cssLike = lang === "css";

  for (const match of code.matchAll(PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) tokens.push({ text: code.slice(lastIndex, index), kind: "plain" });

    const [raw, comment, str, num, ident] = match;
    if (comment) tokens.push({ text: raw, kind: "comment" });
    else if (str) tokens.push({ text: raw, kind: "string" });
    else if (num) tokens.push({ text: raw, kind: "number" });
    else if (ident) {
      const after = code.slice(index + raw.length).match(/^\s*:/);
      if (cssLike && after) tokens.push({ text: raw, kind: "prop" });
      else if (!cssLike && KEYWORDS.has(raw)) tokens.push({ text: raw, kind: "keyword" });
      else tokens.push({ text: raw, kind: "plain" });
    }
    lastIndex = index + raw.length;
  }

  if (lastIndex < code.length) tokens.push({ text: code.slice(lastIndex), kind: "plain" });
  return tokens;
}

export const TOKEN_CLASS: Record<TokenKind, string> = {
  plain: "text-paper",
  comment: "text-steel-dim italic",
  string: "text-crt",
  number: "text-amber",
  keyword: "text-rust font-medium",
  prop: "text-signal",
  punct: "text-steel",
};
