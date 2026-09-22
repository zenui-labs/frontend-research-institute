import type { Reference } from "@/content/types";

/** Numbered references, set like the back matter of a technical paper. */
export function ReferenceList({ items, title }: { items: Reference[]; title?: string }) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title ?? "References"}>
      {title ? (
        <p className="text-steel-dim text-2xs mb-4 font-medium tracking-[0.14em] uppercase">
          {title}
        </p>
      ) : null}
      <ol className="space-y-4">
        {items.map((reference, i) => (
          <li key={reference.url} className="flex gap-4">
            <span className="text-steel-dim text-2xs w-6 shrink-0 font-mono tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0">
              <span className="text-steel-dim text-2xs block tracking-[0.12em] uppercase">
                {reference.source}
              </span>
              <a
                href={reference.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-bone decoration-line-bright hover:decoration-crt mt-0.5 block text-sm underline underline-offset-4 transition-colors"
              >
                {reference.label}
              </a>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
