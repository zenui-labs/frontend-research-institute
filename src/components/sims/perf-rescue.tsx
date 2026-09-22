"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import { play } from "@/lib/sound";
import { observe } from "@/lib/observation-log";
import { RetroButton } from "@/components/ui/retro-button";
import { SimFrame } from "./sim-frame";

type Metrics = { lcp: number; inp: number; cls: number; js: number; img: number; font: number };

const BASE: Metrics = { lcp: 7.8, inp: 840, cls: 0.42, js: 4.8, img: 17, font: 2.1 };

type Intervention = {
  id: string;
  label: string;
  detail: string;
  apply: (m: Metrics) => Metrics;
  verdict: "major" | "minor" | "trap";
};

const INTERVENTIONS: Intervention[] = [
  {
    id: "images",
    label: "Serve AVIF/WebP at display size",
    detail: "17MB of full-resolution JPEG for slots that are never larger than 800px wide.",
    verdict: "major",
    apply: (m) => ({ ...m, img: 1.9, lcp: m.lcp - 2.4 }),
  },
  {
    id: "preload-hero",
    label: "Preload the hero image, fetchpriority=high",
    detail: "The LCP element is discovered late because it is set by a stylesheet.",
    verdict: "major",
    apply: (m) => ({ ...m, lcp: m.lcp - 1.1 }),
  },
  {
    id: "lazy-hero",
    label: 'Add loading="lazy" to every image',
    detail: "Including the hero, which is the element LCP is measuring.",
    verdict: "trap",
    apply: (m) => ({ ...m, lcp: m.lcp + 0.9 }),
  },
  {
    id: "split",
    label: "Route-level code splitting",
    detail: "One bundle serves twelve routes. Most visitors need one of them.",
    verdict: "major",
    apply: (m) => ({ ...m, js: m.js * 0.38, inp: m.inp - 190, lcp: m.lcp - 0.7 }),
  },
  {
    id: "remove-dep",
    label: "Remove the 380KB date library",
    detail: "Used in three places, all of which Intl.DateTimeFormat covers.",
    verdict: "minor",
    apply: (m) => ({ ...m, js: m.js - 0.38, inp: m.inp - 40 }),
  },
  {
    id: "long-tasks",
    label: "Break up the 600ms hydration task",
    detail: "One synchronous block owns the main thread through the first interaction.",
    verdict: "major",
    apply: (m) => ({ ...m, inp: m.inp - 380 }),
  },
  {
    id: "dimensions",
    label: "Set width/height on images and embeds",
    detail: "Nine elements reserve no space, so everything below them jumps on load.",
    verdict: "major",
    apply: (m) => ({ ...m, cls: m.cls - 0.26 }),
  },
  {
    id: "font-display",
    label: "font-display: swap with a matched fallback",
    detail: "2.1MB of webfonts, blocking text and reflowing it when they arrive.",
    verdict: "minor",
    apply: (m) => ({ ...m, font: 0.4, cls: m.cls - 0.09, lcp: m.lcp - 0.4 }),
  },
  {
    id: "banner",
    label: "Reserve space for the consent banner",
    detail: "Injected at the top of the document 1.2s after load, pushing the page down.",
    verdict: "minor",
    apply: (m) => ({ ...m, cls: m.cls - 0.07 }),
  },
  {
    id: "minify",
    label: "Re-minify and enable Brotli",
    detail: "Already minified. Already Brotli. Somebody suggested it in review.",
    verdict: "trap",
    apply: (m) => ({ ...m, js: m.js - 0.02 }),
  },
];

const THRESHOLDS = { lcp: [2.5, 4], inp: [200, 500], cls: [0.1, 0.25] } as const;

function grade(value: number, [good, poor]: readonly [number, number]) {
  if (value <= good) return "good";
  if (value <= poor) return "mid";
  return "poor";
}

function Gauge({
  label,
  value,
  unit,
  bounds,
  max,
}: {
  label: string;
  value: number;
  unit: string;
  bounds: readonly [number, number];
  max: number;
}) {
  const state = grade(value, bounds);
  return (
    <div className="border-line bg-ink-900/50 border p-3">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-2xs text-steel-dim font-medium tracking-[0.08em] uppercase">
          {label}
        </span>
        <span
          className={cn(
            "font-mono text-lg tabular-nums",
            state === "good" ? "text-crt" : state === "mid" ? "text-amber" : "text-rust",
          )}
        >
          {unit === "s" ? value.toFixed(2) : unit === "" ? value.toFixed(3) : Math.round(value)}
          <span className="text-2xs ml-0.5 opacity-70">{unit}</span>
        </span>
      </div>
      <div className="bg-ink-950 relative h-2 w-full">
        <div
          className={cn(
            "h-full transition-[width] duration-300",
            state === "good" ? "bg-crt/70" : state === "mid" ? "bg-amber/70" : "bg-rust/70",
          )}
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
        <span
          aria-hidden
          className="bg-crt/60 absolute top-0 h-full w-px"
          style={{ left: `${(bounds[0] / max) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function PerfRescueSim() {
  const [applied, setApplied] = useState<string[]>([]);

  const metrics = useMemo(
    () =>
      INTERVENTIONS.filter((i) => applied.includes(i.id)).reduce<Metrics>(
        (m, i) => i.apply(m),
        BASE,
      ),
    [applied],
  );

  const clamped: Metrics = {
    ...metrics,
    lcp: Math.max(0.9, metrics.lcp),
    inp: Math.max(45, metrics.inp),
    cls: Math.max(0, Number(metrics.cls.toFixed(3))),
    js: Math.max(0.12, metrics.js),
  };

  const passing =
    grade(clamped.lcp, THRESHOLDS.lcp) === "good" &&
    grade(clamped.inp, THRESHOLDS.inp) === "good" &&
    grade(clamped.cls, THRESHOLDS.cls) === "good";

  return (
    <SimFrame
      code="BENCH-05A"
      title="Site rescue"
      status={passing ? "SITE SAVED" : "PATIENT CRITICAL"}
      note="Modelled deltas based on typical field data. Your site's numbers will differ; the ranking of interventions usually does not."
      readout={
        <p>
          {passing ? (
            <span className="text-crt">
              All three Core Web Vitals are in the good range. The intern has been informed.
            </span>
          ) : (
            <>
              <span className="text-steel-dim">TRANSFER </span>
              <span className="text-bone">
                {(clamped.js + clamped.img + clamped.font).toFixed(1)}MB
              </span>
              <span className="text-steel-dim"> · JS </span>
              <span className="text-bone">{clamped.js.toFixed(2)}MB</span>
              <span className="text-steel-dim"> · IMAGES </span>
              <span className="text-bone">{clamped.img.toFixed(1)}MB</span>
              <span className="text-steel-dim"> · FONTS </span>
              <span className="text-bone">{clamped.font.toFixed(1)}MB</span>
            </>
          )}
        </p>
      }
    >
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <div className="space-y-3">
          <Gauge label="LCP" value={clamped.lcp} unit="s" bounds={THRESHOLDS.lcp} max={8} />
          <Gauge label="INP" value={clamped.inp} unit="ms" bounds={THRESHOLDS.inp} max={900} />
          <Gauge label="CLS" value={clamped.cls} unit="" bounds={THRESHOLDS.cls} max={0.5} />
          <RetroButton size="sm" onClick={() => setApplied([])} className="w-full">
            <RotateCcw size={12} aria-hidden /> Restore the terrible website
          </RetroButton>
        </div>

        <ul className="space-y-2">
          {INTERVENTIONS.map((item) => {
            const on = applied.includes(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setApplied((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((i) => i !== item.id)
                        : [...prev, item.id],
                    );
                    play(on ? "click" : item.verdict === "trap" ? "error" : "beep");
                    observe("USER ACTION", `${on ? "reverted" : "applied"}: ${item.label}`);
                    if (!on && item.verdict === "trap") {
                      observe("RESULT", "intervention made the measurement worse");
                    }
                  }}
                  className={cn(
                    "w-full border px-3 py-2 text-left transition-colors",
                    on
                      ? item.verdict === "trap"
                        ? "border-rust/60 bg-rust/10"
                        : "border-crt/50 bg-crt/[0.07]"
                      : "border-line bg-ink-900/40 hover:border-line-bright",
                  )}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        "font-mono text-xs",
                        on ? (item.verdict === "trap" ? "text-rust" : "text-crt") : "text-bone",
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="text-2xs text-steel-dim shrink-0 font-medium tracking-[0.08em] uppercase">
                      {on ? "applied" : "available"}
                    </span>
                  </span>
                  <span className="text-steel-dim mt-1 block text-xs leading-snug">
                    {item.detail}
                  </span>
                  {on && item.verdict === "trap" ? (
                    <span className="text-2xs text-rust mt-1 block font-medium tracking-[0.08em] uppercase">
                      ⚠ made it worse / changed nothing
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </SimFrame>
  );
}
