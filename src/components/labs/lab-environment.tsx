import type { Laboratory } from "@/content/types";
import { cn } from "@/lib/cn";

const TINT: Record<Laboratory["accent"], string> = {
  crt: "bg-sage text-crt",
  amber: "bg-butter text-amber",
  rust: "bg-peach text-rust",
  signal: "bg-butter text-signal",
  steel: "bg-ink-700 text-steel",
};

const DIAGRAM: Record<string, string> = {
  engine: `HTML → DOM
CSS → CSSOM
 ↓ style
 ↓ layout
 ↓ paint
 ↓ composite
 SCREEN`,
  measure: `containing block
└ margin
 └ border
 └ padding
 └ content 320px`,
  circuit: `call stack
microtask queue
task queue
─────────────
one thread`,
  tree: `APP
├── HEADER
├── SIDEBAR
│ ├── NAV
│ └── USER
└── CONTENT
 ├── POST
 └── COMMENTS`,
  gauge: `LCP 7.8s → 2.1s
INP 840ms → 140ms
CLS 0.42 → 0.04`,
  nodes: `USER → DNS → TLS
 → SERVER
 → RESPONSE
rtt 150ms`,
  vault: `origin A ─┐
origin B ─┼─ same-origin policy
origin C ─┘`,
  twin: `DOM TREE A11Y TREE
div generic
└ div └ button
 └ span "Save"`,
  graph: `APPLICATION
├── PACKAGE A
│ ├── PACKAGE C
│ └── PACKAGE D
├── PACKAGE B
└── PACKAGE F`,
};

/**
 * A quiet room portrait: one tinted block per laboratory with the diagram that
 * room is actually about. Decorative, and hidden from assistive technology, * the prose beside it carries the meaning.
 */
export function LabEnvironment({ lab }: { lab: Laboratory }) {
  return (
    <div
      className={cn(
        "relative flex h-52 items-center justify-center overflow-hidden rounded-[24px] px-6 sm:h-64",
        TINT[lab.accent],
      )}
    >
      <pre aria-hidden className="text-2xs font-mono leading-relaxed opacity-80">
        {DIAGRAM[lab.environment] ?? DIAGRAM.engine}
      </pre>
      <span className="label-tech absolute bottom-3 left-4">{lab.code}</span>
    </div>
  );
}
