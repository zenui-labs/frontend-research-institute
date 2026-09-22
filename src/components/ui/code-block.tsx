import { cn } from "@/lib/cn";
import { CopyButton } from "./copy-button";
import { TOKEN_CLASS, tokenize } from "./syntax";

const DEFAULT_NAME: Record<string, string> = {
  css: "example.css",
  html: "example.html",
  js: "example.js",
  jsx: "example.jsx",
  ts: "example.ts",
  json: "package.json",
  http: "request.http",
  text: "output.txt",
};

export function CodeBlock({
  code,
  lang,
  caption,
  filename,
  highlight = [],
  className,
}: {
  code: string;
  lang: string;
  caption?: string;
  filename?: string;
  highlight?: number[];
  className?: string;
}) {
  const lines = code.replace(/\n$/, "").split("\n");
  const gutterWidth = String(lines.length).length;

  return (
    <figure
      className={cn("border-line bg-ink-900 overflow-hidden rounded-[24px] border", className)}
    >
      <div className="border-line flex items-center justify-between gap-4 border-b px-3 py-2">
        <span className="text-2xs text-steel font-mono">
          {filename ?? DEFAULT_NAME[lang] ?? "snippet"}
        </span>
        <span className="flex items-center gap-4">
          <span className="text-2xs text-steel-dim tracking-[0.12em] uppercase">{lang}</span>
          <CopyButton value={code} />
        </span>
      </div>

      <div className="overflow-x-auto">
        <pre className="min-w-full py-2.5 text-[13px] leading-[1.7]">
          <code className="block font-mono">
            {lines.map((line, i) => {
              const lit = highlight.includes(i + 1);
              return (
                <span
                  key={i}
                  className={cn(
                    "flex min-w-full px-3",
                    lit && "bg-crt/[0.07] shadow-[inset_2px_0_0_0_var(--color-crt)]",
                  )}
                >
                  <span
                    aria-hidden
                    className="text-steel-dim/70 mr-4 shrink-0 text-right tabular-nums select-none"
                    style={{ width: `${gutterWidth}ch` }}
                  >
                    {i + 1}
                  </span>
                  <span className="whitespace-pre">
                    {tokenize(line, lang).map((token, j) => (
                      <span key={j} className={TOKEN_CLASS[token.kind]}>
                        {token.text}
                      </span>
                    ))}
                  </span>
                </span>
              );
            })}
          </code>
        </pre>
      </div>

      {caption ? (
        <figcaption className="border-line text-steel-dim border-t px-3 py-2 text-xs">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
