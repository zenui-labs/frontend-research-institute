"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { SimFrame } from "./sim-frame";

type Entry = {
  declaration: string;
  creates: boolean;
  family: string;
  why: string;
};

const ENTRIES: Entry[] = [
  {
    declaration: "position: relative",
    creates: false,
    family: "",
    why: "Positioning alone does nothing. It needs a z-index other than auto.",
  },
  {
    declaration: "position: relative; z-index: 0",
    creates: true,
    family: "classic",
    why: "A positioned element with any z-index other than auto, including 0.",
  },
  {
    declaration: "position: fixed",
    creates: true,
    family: "classic",
    why: "Fixed and sticky always create one, z-index or not.",
  },
  {
    declaration: "position: sticky",
    creates: true,
    family: "classic",
    why: "Same as fixed: always, regardless of z-index.",
  },
  {
    declaration: "opacity: 0.99",
    creates: true,
    family: "group",
    why: "Any opacity below 1 requires the subtree to be flattened into one group first.",
  },
  {
    declaration: "opacity: 1",
    creates: false,
    family: "",
    why: "Fully opaque needs no grouping, so no context.",
  },
  {
    declaration: "transform: translateZ(0)",
    creates: true,
    family: "compositing",
    why: "Any transform other than none. Also makes the element a containing block for fixed descendants.",
  },
  {
    declaration: "filter: blur(0px)",
    creates: true,
    family: "group",
    why: "A filter applies to the rendered group, even a zero-strength one.",
  },
  {
    declaration: "backdrop-filter: blur(4px)",
    creates: true,
    family: "group",
    why: "Needs a defined backdrop group to sample from.",
  },
  {
    declaration: "mix-blend-mode: multiply",
    creates: true,
    family: "group",
    why: "Blending requires a group to blend against.",
  },
  {
    declaration: "isolation: isolate",
    creates: true,
    family: "group",
    why: "Its only job is to create a stacking context and stop blend modes escaping.",
  },
  {
    declaration: "will-change: transform",
    creates: true,
    family: "compositing",
    why: "Creates the context eagerly, before any transform is applied.",
  },
  {
    declaration: "will-change: color",
    creates: false,
    family: "",
    why: "will-change only creates a context for properties that would create one themselves.",
  },
  {
    declaration: "contain: paint",
    creates: true,
    family: "containment",
    why: "Paint containment promises nothing renders outside the box, a group guarantee.",
  },
  {
    declaration: "content-visibility: auto",
    creates: true,
    family: "containment",
    why: "Implies layout, style and paint containment.",
  },
  {
    declaration: "overflow: hidden",
    creates: false,
    family: "",
    why: "Clips, and creates a block formatting context, but not a stacking context.",
  },
  {
    declaration: "display: flex",
    creates: false,
    family: "",
    why: "Creates a flex formatting context. A flex *child* with z-index does create a stacking context.",
  },
  {
    declaration: "clip-path: inset(0)",
    creates: true,
    family: "group",
    why: "The group must be assembled before it can be clipped.",
  },
];

export default function StackingCreatorsSim() {
  const [selected, setSelected] = useState(0);
  const [revealed, setRevealed] = useState<number[]>([]);
  const entry = ENTRIES[selected];
  const isRevealed = revealed.includes(selected);

  return (
    <SimFrame
      code="BENCH-02B"
      title="Context detector"
      status={`${revealed.length} / ${ENTRIES.length} TESTED`}
      readout={
        isRevealed ? (
          <p>
            <span className={entry.creates ? "text-amber" : "text-crt"}>
              {entry.creates ? "CREATES A STACKING CONTEXT" : "DOES NOT CREATE ONE"}
            </span>
            {", "}
            {entry.why}
          </p>
        ) : (
          <p className="text-steel-dim">SPECIMEN LOADED. Predict the answer, then reveal.</p>
        )
      }
    >
      <div className="bg-line grid gap-px sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
        <ul className="bg-ink-800 max-h-[360px] overflow-y-auto">
          {ENTRIES.map((item, i) => (
            <li key={item.declaration}>
              <button
                type="button"
                onClick={() => setSelected(i)}
                className={cn(
                  "border-line/60 text-2xs flex w-full items-center justify-between gap-2 border-b px-3 py-2 text-left font-mono transition-colors",
                  i === selected
                    ? "bg-crt/10 text-crt"
                    : "text-steel hover:bg-ink-700 hover:text-bone",
                )}
              >
                <span className="truncate">{item.declaration}</span>
                {revealed.includes(i) ? (
                  item.creates ? (
                    <Check
                      size={12}
                      className="text-amber shrink-0"
                      aria-label="creates a context"
                    />
                  ) : (
                    <X size={12} className="text-steel-dim shrink-0" aria-label="no context" />
                  )
                ) : null}
              </button>
            </li>
          ))}
        </ul>

        <div className="bg-ink-850 flex flex-col justify-between gap-6 p-5">
          <div>
            <p className="label-tech mb-3">Specimen</p>
            <pre className="border-line bg-ink-900 text-paper/90 border px-3 py-3 font-mono text-sm">
              .wrapper {"{"}
              {"\n "}
              <span className="text-signal">{entry.declaration};</span>
              {"\n"}
              {"}"}
            </pre>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["creates", "does not"] as const).map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() =>
                  setRevealed((prev) => (prev.includes(selected) ? prev : [...prev, selected]))
                }
                className={cn(
                  "text-2xs border px-3 py-2 font-medium tracking-[0.1em] uppercase transition-colors",
                  isRevealed
                    ? (choice === "creates") === entry.creates
                      ? "border-crt/60 bg-crt/10 text-crt"
                      : "border-line text-steel-dim"
                    : "border-line text-steel hover:border-line-bright hover:text-bone",
                )}
              >
                {choice === "creates" ? "Creates a context" : "Does not"}
              </button>
            ))}
          </div>

          {isRevealed ? (
            <p className="border-line text-steel border-t pt-4 text-sm leading-relaxed">
              <span className="text-2xs text-steel-dim font-medium tracking-[0.08em] uppercase">
                FAMILY: {entry.family}
              </span>
              <br />
              {entry.why}
            </p>
          ) : null}
        </div>
      </div>
    </SimFrame>
  );
}
