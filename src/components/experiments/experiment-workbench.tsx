"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type OutlineItem = { id: string; label: string; number: string };

/**
 * Experiment documents are read like a file in an editor: a path bar at the
 * top, an outline rail that tracks the section you are in, and a status bar
 * carrying the metadata that would otherwise clutter the prose.
 */
export function ExperimentWorkbench({
  path,
  fileName,
  outline,
  status,
  statusBar,
  children,
}: {
  path: string[];
  fileName: string;
  outline: OutlineItem[];
  status?: ReactNode;
  statusBar: ReactNode;
  children: ReactNode;
}) {
  const [activeId, setActiveId] = useState(outline[0]?.id);

  useEffect(() => {
    const headings = outline
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-88px 0px -65% 0px", threshold: 0 },
    );

    headings.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [outline]);

  return (
    <div className="border-line bg-ink-850 overflow-hidden rounded-[24px] border">
      <div className="border-line flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-2.5">
        <span className="text-steel-dim min-w-0 truncate font-mono text-xs">
          {path.map((segment) => (
            <span key={segment}>
              {segment}
              <span className="text-line-bright"> / </span>
            </span>
          ))}
          <span className="text-bone">{fileName}</span>
        </span>
        {status ? <span className="ml-auto flex items-center gap-2">{status}</span> : null}
      </div>

      <div className="grid lg:grid-cols-[228px_minmax(0,1fr)]">
        <nav
          aria-label="Document outline"
          className="border-line order-2 border-t p-3 lg:sticky lg:top-20 lg:order-1 lg:h-fit lg:border-t-0 lg:border-r"
        >
          <p className="label-tech mb-2 px-2">Outline</p>
          <ul>
            {outline.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={activeId === item.id ? "true" : undefined}
                  className={cn(
                    "flex items-baseline gap-2.5 rounded-[12px] px-2 py-1.5 transition-colors",
                    activeId === item.id
                      ? "bg-ink-800 text-bone"
                      : "text-steel hover:bg-ink-800 hover:text-bone",
                  )}
                >
                  <span
                    className={cn(
                      "text-2xs font-mono tabular-nums",
                      activeId === item.id ? "text-crt" : "text-steel-dim",
                    )}
                  >
                    {item.number}
                  </span>
                  <span className="truncate text-sm">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="order-1 min-w-0 lg:order-2">{children}</div>
      </div>

      <div className="border-line text-2xs text-steel-dim flex flex-wrap items-center gap-x-5 gap-y-1 border-t px-4 py-2 font-mono">
        {statusBar}
      </div>
    </div>
  );
}

/** A numbered section inside the document pane, with an editor-style gutter. */
export function DocumentSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="border-line scroll-mt-24 border-b px-6 py-8 last:border-b-0 sm:px-8"
    >
      <h2 className="mb-6 flex items-baseline gap-3">
        <span className="text-crt font-mono text-xs tabular-nums">{number}</span>
        <span className="font-display text-2xl font-semibold">{title}</span>
      </h2>
      {children}
    </section>
  );
}
