"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Readout, SimFrame } from "./sim-frame";

type Pkg = {
  name: string;
  version: string;
  kb: number;
  esm: boolean;
  sideEffects: boolean;
  deps: string[];
  note?: string;
};

/** A fictional registry, sized to behave like the real thing. */
const REGISTRY: Record<string, Pkg> = {
  "chrono-fmt@2": {
    name: "chrono-fmt",
    version: "2.4.1",
    kb: 78,
    esm: false,
    sideEffects: true,
    deps: ["tz-data@1", "plural-rules@3"],
    note: "CommonJS, nothing can be shaken out",
  },
  "tz-data@1": {
    name: "tz-data",
    version: "1.9.0",
    kb: 210,
    esm: true,
    sideEffects: false,
    deps: [],
  },
  "plural-rules@3": {
    name: "plural-rules",
    version: "3.0.2",
    kb: 22,
    esm: true,
    sideEffects: false,
    deps: ["locale-core@4"],
  },
  "locale-core@4": {
    name: "locale-core",
    version: "4.1.0",
    kb: 31,
    esm: true,
    sideEffects: false,
    deps: [],
  },
  "locale-core@3": {
    name: "locale-core",
    version: "3.8.2",
    kb: 29,
    esm: true,
    sideEffects: false,
    deps: [],
    note: "Duplicate major version, both copies ship",
  },
  "icon-set@5": {
    name: "icon-set",
    version: "5.2.0",
    kb: 340,
    esm: true,
    sideEffects: true,
    deps: [],
    note: "sideEffects not declared, the barrel file keeps everything",
  },
  "chart-kit@1": {
    name: "chart-kit",
    version: "1.7.3",
    kb: 190,
    esm: true,
    sideEffects: false,
    deps: ["vec-math@2", "locale-core@3"],
  },
  "vec-math@2": {
    name: "vec-math",
    version: "2.0.4",
    kb: 46,
    esm: true,
    sideEffects: false,
    deps: [],
  },
  "uuid-lite@9": {
    name: "uuid-lite",
    version: "9.0.0",
    kb: 4,
    esm: true,
    sideEffects: false,
    deps: ["rng-shim@2"],
    note: "crypto.randomUUID() has been available since 2021",
  },
  "rng-shim@2": {
    name: "rng-shim",
    version: "2.1.1",
    kb: 9,
    esm: false,
    sideEffects: true,
    deps: [],
  },
  "deep-clone@4": {
    name: "deep-clone",
    version: "4.3.0",
    kb: 12,
    esm: true,
    sideEffects: false,
    deps: [],
    note: "structuredClone() is built in",
  },
};

const INSTALLABLE = ["chrono-fmt@2", "icon-set@5", "chart-kit@1", "uuid-lite@9", "deep-clone@4"];

function closure(roots: string[]): Set<string> {
  const seen = new Set<string>();
  const queue = [...roots];
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id) || !REGISTRY[id]) continue;
    seen.add(id);
    queue.push(...REGISTRY[id].deps);
  }
  return seen;
}

export default function DependencyGraphSim() {
  const [installed, setInstalled] = useState<string[]>(["chrono-fmt@2"]);

  const resolved = useMemo(() => closure(installed), [installed]);

  const packages = [...resolved].map((id) => REGISTRY[id]);
  const totalKb = packages.reduce((sum, p) => sum + p.kb, 0);
  const shippedKb = packages.reduce(
    (sum, p) => sum + (p.esm && !p.sideEffects ? Math.round(p.kb * 0.35) : p.kb),
    0,
  );
  const duplicates = packages.map((p) => p.name).filter((name, i, arr) => arr.indexOf(name) !== i);
  const transitive = resolved.size - installed.length;

  return (
    <SimFrame
      code="BENCH-09A"
      title="Dependency observatory"
      status={`${resolved.size} PACKAGES`}
      controls={
        <div>
          <p className="label-tech mb-3">Registry</p>
          <ul className="space-y-2">
            {INSTALLABLE.map((id) => {
              const on = installed.includes(id);
              const pkg = REGISTRY[id];
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() =>
                      setInstalled((prev) => (on ? prev.filter((p) => p !== id) : [...prev, id]))
                    }
                    className={cn(
                      "flex w-full items-center justify-between gap-2 border px-2 py-1.5 text-left transition-colors",
                      on
                        ? "border-crt/50 bg-crt/[0.07] text-crt"
                        : "border-line text-steel hover:text-bone",
                    )}
                  >
                    <span className="text-2xs truncate font-mono">
                      {pkg.name}@{pkg.version}
                    </span>
                    {on ? <X size={11} aria-hidden /> : <Plus size={11} aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      }
      readout={
        <Readout
          rows={[
            ["Direct dependencies", installed.length],
            ["Transitive dependencies", transitive],
            ["Unpacked total", `${totalKb}KB`],
            [
              "Estimated shipped",
              <span className={shippedKb > 400 ? "text-rust" : "text-crt"} key="s">
                {shippedKb}KB
              </span>,
            ],
            [
              "Duplicate packages",
              duplicates.length ? (
                <span className="text-amber" key="d">
                  {[...new Set(duplicates)].join(", ")}
                </span>
              ) : (
                "none"
              ),
            ],
          ]}
        />
      }
      note={
        transitive > 3
          ? "You installed a handful of packages. They brought friends. The friends brought opinions about module formats."
          : "A small graph. Enjoy it while it lasts."
      }
    >
      <div className="p-4">
        <pre className="border-line bg-ink-900 text-steel mb-4 overflow-x-auto border px-3 py-3 font-mono text-xs leading-relaxed">
          {`APPLICATION
${
  installed
    .map((id, i) => {
      const pkg = REGISTRY[id];
      const last = i === installed.length - 1;
      const branch = last ? "└──" : "├──";
      const childPrefix = last ? " " : "│ ";
      const kids = pkg.deps
        .map((depId, j) => {
          const dep = REGISTRY[depId];
          const lastKid = j === pkg.deps.length - 1;
          const kidBranch = lastKid ? "└──" : "├──";
          const grand = dep.deps
            .map(
              (g) =>
                `${childPrefix}${lastKid ? " " : "│ "}└── ${REGISTRY[g].name}@${REGISTRY[g].version}`,
            )
            .join("\n");
          return `${childPrefix}${kidBranch} ${dep.name}@${dep.version}${grand ? "\n" + grand : ""}`;
        })
        .join("\n");
      return `${branch} ${pkg.name}@${pkg.version}${kids ? "\n" + kids : ""}`;
    })
    .join("\n") || "(nothing installed, the fastest possible bundle)"
}`}
        </pre>

        <ul className="space-y-2">
          {packages
            .filter((p) => p.note)
            .map((p) => (
              <li
                key={`${p.name}@${p.version}`}
                className="text-amber/90 flex gap-2 text-xs leading-snug"
              >
                <span aria-hidden>▲</span>
                <span>
                  <span className="text-bone font-mono text-xs">{p.name}</span>, {p.note}
                </span>
              </li>
            ))}
        </ul>
      </div>
    </SimFrame>
  );
}
