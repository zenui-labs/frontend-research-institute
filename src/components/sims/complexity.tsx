"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { observe } from "@/lib/observation-log";
import { play } from "@/lib/sound";
import { RetroButton } from "@/components/ui/retro-button";
import { ControlGroup, Readout, SimFrame, Slider } from "./sim-frame";

type Strategy = "scan" | "index" | "pairs";

type Result = { strategy: Strategy; ms: number; ops: number; n: number };

const SHORT_LABEL: Record<Strategy, string> = {
  scan: "Run array scan",
  index: "Run map index",
  pairs: "Run pairwise",
};

const STRATEGY: Record<Strategy, { label: string; complexity: string; note: string }> = {
  scan: {
    label: "Array.find on every lookup",
    complexity: "O(n) per lookup, O(n²) for n lookups",
    note: "The usual shape of a slow list: a lookup inside a render that is itself inside a loop.",
  },
  index: {
    label: "Map built once, then read",
    complexity: "O(n) once, O(1) per lookup",
    note: "Same data, one pass to index it, then constant-time reads.",
  },
  pairs: {
    label: "Compare every pair",
    complexity: "O(n²)",
    note: "Deduplication and collision checks written the obvious way.",
  },
};

/** Real work on real data: the timings below come from your device, not a table. */
function run(strategy: Strategy, n: number): Result {
  const rows = Array.from({ length: n }, (_, i) => ({ id: `row-${i}`, value: i }));
  const lookups = Array.from({ length: Math.min(n, 400) }, (_, i) => `row-${(i * 7) % n}`);
  let ops = 0;
  const start = performance.now();

  if (strategy === "scan") {
    for (const id of lookups) {
      rows.find((row) => {
        ops += 1;
        return row.id === id;
      });
    }
  }

  if (strategy === "index") {
    const index = new Map<string, { id: string; value: number }>();
    for (const row of rows) {
      ops += 1;
      index.set(row.id, row);
    }
    for (const id of lookups) {
      ops += 1;
      index.get(id);
    }
  }

  if (strategy === "pairs") {
    const limit = Math.min(n, 1200);
    for (let i = 0; i < limit; i += 1) {
      for (let j = i + 1; j < limit; j += 1) {
        ops += 1;
        if (rows[i].value === rows[j].value) break;
      }
    }
  }

  return { strategy, ms: performance.now() - start, ops, n };
}

export default function ComplexitySim() {
  const [n, setN] = useState(2000);
  const [results, setResults] = useState<Partial<Record<Strategy, Result>>>({});
  const [busy, setBusy] = useState(false);

  function measure(strategy: Strategy) {
    setBusy(true);
    observe("USER ACTION", `${STRATEGY[strategy].label}, n = ${n}`);
    // Let the button paint its pressed state before the thread is occupied.
    requestAnimationFrame(() => {
      const result = run(strategy, n);
      setResults((prev) => ({ ...prev, [strategy]: result }));
      setBusy(false);
      observe(
        "MEASUREMENT",
        `${result.ms.toFixed(1)}ms across ${result.ops.toLocaleString("en-US")} operations`,
      );
      play("beep");
    });
  }

  const rows = (["scan", "index", "pairs"] as const)
    .map((strategy) => results[strategy])
    .filter(Boolean) as Result[];
  const slowest = Math.max(1, ...rows.map((row) => row.ms));

  return (
    <SimFrame
      code="BENCH-10A"
      title="Cost of a lookup"
      status={busy ? "MEASURING" : rows.length ? `${rows.length} RECORDED` : "IDLE"}
      controls={
        <>
          <ControlGroup label="Dataset">
            <Slider label="rows" value={n} min={500} max={20000} step={500} onChange={setN} />
          </ControlGroup>
          <ControlGroup label="Strategy">
            <div className="space-y-2">
              {(Object.keys(STRATEGY) as Strategy[]).map((strategy) => (
                <RetroButton
                  key={strategy}
                  size="sm"
                  variant={strategy === "index" ? "primary" : "ghost"}
                  className="w-full"
                  disabled={busy}
                  onClick={() => measure(strategy)}
                >
                  {SHORT_LABEL[strategy]}
                </RetroButton>
              ))}
            </div>
          </ControlGroup>
        </>
      }
      readout={
        rows.length === 0 ? (
          <p className="text-steel-dim">
            Nothing measured yet. Each run executes on your device, at the size you chose.
          </p>
        ) : (
          <Readout
            rows={rows.map((row) => [
              STRATEGY[row.strategy].complexity,
              `${row.ms.toFixed(1)}ms · ${row.ops.toLocaleString("en-US")} ops`,
            ])}
          />
        )
      }
    >
      <div className="space-y-4 p-5">
        {(Object.keys(STRATEGY) as Strategy[]).map((strategy) => {
          const result = results[strategy];
          return (
            <div key={strategy}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3">
                <span className="text-bone text-sm font-medium">{STRATEGY[strategy].label}</span>
                <span className="text-steel-dim font-mono text-xs">
                  {STRATEGY[strategy].complexity}
                </span>
              </div>
              <div className="bg-ink-800 h-2.5 w-full overflow-hidden rounded-full">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-500",
                    strategy === "index"
                      ? "bg-crt"
                      : result && result.ms > 30
                        ? "bg-rust"
                        : "bg-amber",
                  )}
                  style={{ width: result ? `${Math.max(2, (result.ms / slowest) * 100)}%` : "0%" }}
                />
              </div>
              <p className="text-steel-dim mt-2 text-xs leading-relaxed">
                {result
                  ? `${result.ms.toFixed(1)}ms for ${result.ops.toLocaleString("en-US")} operations at n = ${result.n.toLocaleString("en-US")}`
                  : STRATEGY[strategy].note}
              </p>
            </div>
          );
        })}
      </div>
    </SimFrame>
  );
}
