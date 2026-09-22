import { Fragment, type ReactNode } from "react";

/**
 * Markdown-lite: `code` and **bold** only. Content stays plain data, and the
 * renderer stays a dozen lines instead of a markdown dependency.
 */
export function RichText({ text }: { text: string }): ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code
              key={i}
              className="border-line-bright bg-ink-700 text-bone rounded-[12px] border px-1 py-px font-mono text-[0.86em]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={i} className="text-bone font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
