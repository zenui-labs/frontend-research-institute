"use client";

import { Award, Lock } from "lucide-react";
import { BADGES } from "@/content";
import type { Badge } from "@/content/types";
import { cn } from "@/lib/cn";
import { useHydrated, useProgress, type ProgressState } from "@/lib/progress";

function earned(badge: Badge, p: ProgressState): boolean {
  const r = badge.requirement;
  switch (r.kind) {
    case "experiments":
      return p.completedExperiments.length >= r.count;
    case "cases":
      return p.solvedCases.length >= r.count;
    case "dossiers":
      return p.readDossiers.length >= r.count;
    case "myths":
      return p.bustedMyths.length >= r.count;
    case "labs":
      return p.visitedLabs.length >= r.count;
    case "discoveries":
      return p.discoveries.length >= r.count;
    case "whyDepth":
      return p.whyDepthRecord >= r.count;
    case "experiment":
      return p.completedExperiments.includes(r.id);
  }
}

export function BadgeGrid() {
  const progress = useProgress();
  const hydrated = useHydrated();
  const unlocked = BADGES.filter((b) => hydrated && earned(b, progress));

  return (
    <div>
      <p className="label-tech mb-4">
        Badges · {unlocked.length} / {BADGES.length} awarded
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BADGES.map((badge) => {
          const has = hydrated && earned(badge, progress);
          return (
            <li
              key={badge.id}
              className={cn(
                "border-line flex gap-3 rounded-[12px] border px-4 py-3 transition-colors",
                has ? "bg-sage shadow-panel" : "bg-ink-850 opacity-70",
              )}
            >
              {has ? (
                <Award size={15} aria-hidden className="text-bone mt-0.5 shrink-0" />
              ) : (
                <Lock size={15} aria-hidden className="text-steel-dim mt-0.5 shrink-0" />
              )}
              <div>
                <p
                  className={cn(
                    "font-mono text-xs font-medium tracking-[0.08em] uppercase",
                    has ? "text-bone" : "text-steel",
                  )}
                >
                  {badge.name}
                </p>
                <p className="text-steel mt-1 text-sm leading-snug">{badge.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
