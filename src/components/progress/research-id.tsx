"use client";

import { brainDamage, rankOf, scoreOf, useHydrated, useProgress } from "@/lib/progress";
import { cn } from "@/lib/cn";

export function ResearchIdCard({ compact = false }: { compact?: boolean }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const rank = rankOf(progress);
  const damage = brainDamage(progress);

  const rows: [string, string | number][] = [
    ["EXPERIMENTS", progress.completedExperiments.length],
    ["CASES SOLVED", progress.solvedCases.length],
    ["DOSSIERS READ", progress.readDossiers.length],
    ["MYTHS BUSTED", progress.bustedMyths.length],
    ["DISCOVERIES", progress.discoveries.length],
  ];

  return (
    <div className="paperstock border-line shadow-panel overflow-hidden rounded-[24px] border">
      <div className="border-line bg-butter flex items-center justify-between border-b px-4 py-2">
        <span className="text-2xs text-bone font-mono font-medium tracking-[0.06em] uppercase">
          Frontend Research Institute
        </span>
        <span className="led border-line bg-crt h-2 w-2 rounded-full border" />
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <p className="label-tech">Research ID</p>
          <p className="text-bone mt-1 font-mono text-2xl font-bold tracking-[0.08em]">
            {hydrated ? progress.researchId : "FRI-------"}
          </p>
          <p className="label-tech mt-4">Level</p>
          <p className="text-bone mt-1 font-mono text-sm tracking-[0.1em] uppercase">
            {hydrated ? rank.title : ""}
          </p>
          {!compact ? (
            <p className="text-steel-dim mt-1 text-sm">{hydrated ? rank.blurb : ""}</p>
          ) : null}
        </div>

        <div
          aria-hidden
          className="border-line bg-butter hidden h-20 w-20 shrink-0 items-center justify-center rounded-[12px] border sm:flex"
        >
          <span className="text-2xs text-steel-dim font-mono leading-tight tracking-[0.06em]">
            {(hydrated ? progress.researchId : "FRI")
              .replace("FRI-", "")
              .slice(0, 3)
              .padEnd(3, "0")}
          </span>
        </div>
      </div>

      <dl className="border-line bg-line grid grid-cols-2 gap-px border-t sm:grid-cols-5">
        {rows.map(([label, value]) => (
          <div key={label} className="bg-ink-800 px-3 py-2.5">
            <dt className="text-2xs text-steel-dim font-medium tracking-[0.08em] uppercase">
              {label}
            </dt>
            <dd className="text-bone mt-0.5 font-mono text-lg font-bold tabular-nums">
              {hydrated ? value : ""}
            </dd>
          </div>
        ))}
      </dl>

      <div className="border-line bg-ink-850 border-t px-4 py-3">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-2xs text-steel-dim font-medium tracking-[0.08em] uppercase">
            Brain damage
          </span>
          <span className={cn("text-2xs font-mono", damage > 60 ? "text-rust" : "text-amber")}>
            {hydrated ? `${damage}%` : ""}
          </span>
        </div>
        <div className="border-line bg-ink-950 h-2.5 w-full overflow-hidden rounded-full border">
          <div
            className={cn(
              "h-full transition-[width] duration-500",
              damage > 60 ? "bg-rust" : "bg-peach",
            )}
            style={{ width: hydrated ? `${damage}%` : "0%" }}
          />
        </div>
        <p className="text-2xs text-steel-dim mt-2 font-medium tracking-[0.08em] uppercase">
          Score {hydrated ? scoreOf(progress) : 0} · stored locally, never uploaded
        </p>
      </div>
    </div>
  );
}
