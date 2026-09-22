"use client";

import { useState } from "react";
import { Trash2, RotateCcw, ArrowUpDown } from "lucide-react";
import { RetroButton } from "@/components/ui/retro-button";
import { SimFrame } from "./sim-frame";

type Row = { id: number; name: string };

const INITIAL: Row[] = [
  { id: 1, name: "Sample A, stacking context" },
  { id: 2, name: "Sample B, containing block" },
  { id: 3, name: "Sample C, formatting context" },
  { id: 4, name: "Sample D, intrinsic size" },
];

/**
 * Uncontrolled inputs on purpose: the text lives in the DOM node, so it moves
 * exactly when React reuses the wrong instance. This is a real demonstration,
 * not an illustration of one.
 */
function List({ rows, keyBy }: { rows: Row[]; keyBy: "index" | "id" }) {
  return (
    <ul className="space-y-2">
      {rows.map((row, index) => (
        <li key={keyBy === "index" ? index : row.id} className="flex items-center gap-2">
          <span className="text-2xs text-steel-dim w-10 shrink-0 font-mono">
            {keyBy === "index" ? `i=${index}` : `id=${row.id}`}
          </span>
          <input
            defaultValue=""
            placeholder={row.name}
            aria-label={`Note for ${row.name}`}
            className="border-line bg-ink-900 text-bone placeholder:text-steel-dim/50 min-w-0 flex-1 border px-2 py-1.5 font-mono text-xs"
          />
        </li>
      ))}
    </ul>
  );
}

export default function ReactKeysSim() {
  const [rows, setRows] = useState(INITIAL);
  const [generation, setGeneration] = useState(0);

  return (
    <SimFrame
      code="BENCH-04B"
      title="Reconciliation & keys"
      status={`${rows.length} ROWS`}
      readout={
        <p>
          Both lists render the same data. The left list identifies rows by array index; the right
          list identifies them by a stable id. Deleting a row shifts every index below it.
        </p>
      }
    >
      <div key={generation} className="p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <RetroButton
            size="sm"
            variant="danger"
            onClick={() => setRows((r) => r.slice(1))}
            disabled={rows.length === 0}
          >
            <Trash2 size={12} aria-hidden /> Delete first row
          </RetroButton>
          <RetroButton size="sm" onClick={() => setRows((r) => [...r].reverse())}>
            <ArrowUpDown size={12} aria-hidden /> Reverse
          </RetroButton>
          <RetroButton
            size="sm"
            onClick={() => {
              setRows(INITIAL);
              setGeneration((g) => g + 1);
            }}
          >
            <RotateCcw size={12} aria-hidden /> Reset
          </RetroButton>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border-rust/40 bg-rust/[0.04] border p-3">
            <p className="text-2xs text-rust mb-3 font-medium tracking-[0.08em] uppercase">
              key={"{index}"}
            </p>
            <List rows={rows} keyBy="index" />
          </div>
          <div className="border-crt/35 bg-crt/[0.04] border p-3">
            <p className="text-2xs text-crt mb-3 font-medium tracking-[0.08em] uppercase">
              key={"{row.id}"}
            </p>
            <List rows={rows} keyBy="id" />
          </div>
        </div>
      </div>
    </SimFrame>
  );
}
