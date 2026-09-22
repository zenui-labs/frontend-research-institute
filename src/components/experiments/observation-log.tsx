"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { clearObservations, useObservations, type LogChannel } from "@/lib/observation-log";

const CHANNEL_COLOR: Record<LogChannel, string> = {
  "USER ACTION": "text-bone",
  "BROWSER MODEL": "text-crt",
  MEASUREMENT: "text-amber",
  RESULT: "text-rust",
};

export function ObservationLog({ className }: { className?: string }) {
  const entries = useObservations();
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [entries]);

  return (
    <section className={cn("flex min-h-0 flex-col", className)} aria-label="Observation log">
      <div className="border-line flex items-center justify-between gap-4 border-b px-4 py-2">
        <span className="text-2xs text-steel-dim font-medium tracking-[0.14em] uppercase">
          Observation log
        </span>
        <span className="flex items-center gap-4">
          <span className="text-2xs text-steel-dim font-mono tabular-nums">
            {String(entries.length).padStart(3, "0")} entries
          </span>
          <button
            type="button"
            onClick={clearObservations}
            className="text-2xs text-steel-dim hover:text-bone tracking-[0.08em] uppercase transition-colors"
          >
            Clear
          </button>
        </span>
      </div>

      <div ref={scroller} className="min-h-[132px] flex-1 overflow-y-auto px-4 py-3">
        {entries.length === 0 ? (
          <p className="text-steel-dim font-mono text-xs">Waiting for input.</p>
        ) : (
          <ol className="space-y-1">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="grid grid-cols-[62px_112px_minmax(0,1fr)] gap-3 font-mono text-xs"
              >
                <span className="text-steel-dim tabular-nums">{entry.at}</span>
                <span className={cn("truncate", CHANNEL_COLOR[entry.channel])}>
                  {entry.channel}
                </span>
                <span className="text-steel">{entry.message}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
