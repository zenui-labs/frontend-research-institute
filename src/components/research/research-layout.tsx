import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The research document: a narrow context rail, a reading column held at an
 * editorial measure, and a table of contents. Hierarchy comes from type,
 * rules and alignment, not from cards.
 */
export function ResearchLayout({
  context,
  toc,
  children,
}: {
  context: ReactNode;
  toc?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-[1320px] gap-x-12 gap-y-10 px-4 py-12 sm:px-6",
        "lg:grid-cols-[224px_minmax(0,1fr)] xl:grid-cols-[236px_minmax(0,760px)_232px]",
      )}
    >
      <aside className="order-2 lg:order-1">{context}</aside>
      <div className="order-1 min-w-0 lg:order-2">{children}</div>
      {toc ? <aside className="order-3 hidden xl:block">{toc}</aside> : null}
    </div>
  );
}

/** A labelled row in the context rail: label above, value below, rule between. */
export function RailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="label-tech">{label}</p>
      <div className="text-bone mt-1 text-sm">{children}</div>
    </div>
  );
}

/** Groups rail fields so the rhythm comes from spacing, not from rules. */
export function RailFields({ children }: { children: ReactNode }) {
  return <div className="space-y-5">{children}</div>;
}

export function RailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <p className="text-2xs text-steel-dim mb-3 font-medium tracking-[0.14em] uppercase">
        {title}
      </p>
      {children}
    </section>
  );
}

/**
 * Publication header: institute line, document identifiers, subject, title,
 * standfirst, then a metadata table. No hero, no card.
 */
export function DocumentHeader({
  division,
  subject,
  title,
  standfirst,
  meta,
}: {
  division: string;
  subject?: string;
  title: string;
  standfirst?: string;
  meta: { label: string; value: ReactNode }[];
}) {
  return (
    <header>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="text-2xs text-crt font-medium tracking-[0.14em] uppercase">
          {division}
        </span>
        {subject ? (
          <span className="text-2xs text-steel-dim ml-auto tracking-[0.12em] uppercase">
            {subject}
          </span>
        ) : null}
      </div>

      <h1 className="font-display mt-8 max-w-[18ch] text-[2.6rem] leading-[1.06] font-semibold tracking-[-0.03em] text-balance sm:text-[3.1rem]">
        {title}
      </h1>

      {standfirst ? (
        <p className="text-steel mt-5 max-w-[58ch] text-lg leading-relaxed">{standfirst}</p>
      ) : null}

      <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
        {meta.map((item) => (
          <div key={item.label}>
            <dt className="label-tech">{item.label}</dt>
            <dd className="text-bone mt-1 font-mono text-xs">{item.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}

/** Numbered article section with a hanging number in the margin. */
export function DocumentSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-14 scroll-mt-28">
      <h2 className="font-display mb-5 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

/** Editorial previous/next, not CTA cards. */
export function DocumentNav({
  previous,
  next,
}: {
  previous?: { href: string; title: string };
  next?: { href: string; title: string };
}) {
  if (!previous && !next) return null;
  return (
    <nav
      className="border-line mt-20 grid gap-8 border-t pt-8 sm:grid-cols-2"
      aria-label="Document navigation"
    >
      {previous ? (
        <a href={previous.href} className="group">
          <span className="label-tech">Previous</span>
          <span className="font-display group-hover:text-crt mt-0.5 block text-base font-semibold transition-colors">
            {previous.title}
          </span>
        </a>
      ) : (
        <span />
      )}
      {next ? (
        <a href={next.href} className="group sm:text-right">
          <span className="label-tech">Next</span>
          <span className="font-display group-hover:text-crt mt-0.5 block text-base font-semibold transition-colors">
            {next.title}
          </span>
        </a>
      ) : null}
    </nav>
  );
}
