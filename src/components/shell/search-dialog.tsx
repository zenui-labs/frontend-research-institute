"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search, X } from "lucide-react";
import { searchInstitute, type SearchRecord } from "@/content/search";
import { cn } from "@/lib/cn";
import { play } from "@/lib/sound";

const KIND_LABEL: Record<SearchRecord["kind"], string> = {
  EXPERIMENT: "Experiment",
  CASE: "Case file",
  MYTH: "Myth",
  DOSSIER: "Dossier",
  ARTIFACT: "Artifact",
  LAB: "Laboratory",
};

const SUGGESTIONS = ["stacking context", "event loop", "hydration", "z-index", "INP", "keys"];

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useMemo(() => searchInstitute(query, 14), [query]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    play("beep");
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function close() {
    setOpen(false);
    setQuery("");
    setCursor(0);
  }

  function go(record: SearchRecord) {
    close();
    router.push(record.href);
  }

  const dialog = (
    <div
      className="bg-ink-950/80 fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[10vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Search the institute"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="panel rise w-full max-w-2xl overflow-hidden">
        <div className="border-line flex items-center gap-3 border-b px-4 py-3.5">
          <Search size={15} className="text-steel-dim shrink-0" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setCursor((c) => Math.min(c + 1, results.length - 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setCursor((c) => Math.max(c - 1, 0));
              }
              if (event.key === "Enter" && results[cursor]) go(results[cursor]);
            }}
            placeholder="Search experiments, cases, dossiers, myths…"
            className="no-focus-ring text-bone placeholder:text-steel-dim min-w-0 flex-1 bg-transparent text-base outline-none"
          />
          <button
            type="button"
            onClick={close}
            aria-label="Close search"
            className="text-steel-dim hover:text-bone rounded-full p-1 transition-colors"
          >
            <X size={15} aria-hidden />
          </button>
        </div>

        <div className="max-h-[56vh] overflow-y-auto">
          {query.trim().length < 2 ? (
            <div className="px-4 py-5">
              <p className="label-tech mb-3">Try</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      setCursor(0);
                      inputRef.current?.focus();
                    }}
                    className="border-line text-steel hover:border-line-bright hover:text-bone rounded-full border px-3 py-1.5 text-sm transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="font-display text-bone text-base font-semibold">
                No match in the archive
              </p>
              <p className="text-steel mt-2 text-sm">
                Either nobody has researched this yet, or it is classified.
              </p>
            </div>
          ) : (
            <ul className="py-1.5">
              {results.map((record, i) => (
                <li key={`${record.kind}-${record.id}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(record)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                      i === cursor ? "bg-ink-800" : "hover:bg-ink-800/60",
                    )}
                  >
                    <span className="text-2xs text-steel-dim mt-0.5 w-[74px] shrink-0 font-medium tracking-[0.08em] uppercase">
                      {KIND_LABEL[record.kind]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-bone block truncate text-base font-medium">
                        {record.title}
                      </span>
                      <span className="text-steel mt-0.5 line-clamp-1 text-sm">
                        {record.summary}
                      </span>
                    </span>
                    <span className="mt-0.5 flex shrink-0 items-center gap-2">
                      {record.difficulty ? (
                        <span className="text-2xs text-steel-dim tracking-[0.08em] uppercase">
                          {record.difficulty}
                        </span>
                      ) : null}
                      {i === cursor ? (
                        <CornerDownLeft size={13} aria-hidden className="text-crt" />
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-line flex items-center justify-between gap-3 border-t px-4 py-2.5">
          <span className="text-2xs text-steel-dim">
            {results.length > 0
              ? `${results.length} result${results.length === 1 ? "" : "s"}`
              : "Across every division"}
          </span>
          <span className="text-2xs text-steel-dim flex items-center gap-3">
            <span>↑↓ navigate</span>
            <span>↵ open</span>
            <span>esc close</span>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-line text-steel hover:border-line-bright hover:text-bone flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors"
        aria-label="Search the institute"
      >
        <Search size={13} aria-hidden />
        <span className="hidden md:inline">Search</span>
        <kbd className="border-line bg-ink-800 text-2xs text-steel-dim hidden rounded border px-1 font-mono lg:inline">
          ⌘K
        </kbd>
      </button>

      {open && mounted ? createPortal(dialog, document.body) : null}
    </>
  );
}
