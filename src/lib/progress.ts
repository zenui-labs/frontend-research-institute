"use client";

import { useSyncExternalStore } from "react";
import { RANKS, type ResearchRank } from "./ranks";

export { RANKS };
export type { ResearchRank };

/**
 * Local research record. Everything lives in localStorage: the institute never
 * asks anyone to create an account to run an experiment.
 */
export type ProgressState = {
  researchId: string;
  joinedAt: number;
  completedExperiments: string[];
  solvedCases: string[];
  readDossiers: string[];
  bustedMyths: string[];
  visitedLabs: string[];
  discoveries: string[];
  whyDepthRecord: number;
};

const STORAGE_KEY = "fri.research-record.v1";

export const EMPTY_PROGRESS: ProgressState = {
  researchId: "FRI-------",
  joinedAt: 0,
  completedExperiments: [],
  solvedCases: [],
  readDossiers: [],
  bustedMyths: [],
  visitedLabs: [],
  discoveries: [],
  whyDepthRecord: 0,
};

let state: ProgressState | null = null;
const listeners = new Set<() => void>();

function mintResearchId(): string {
  const n = Math.floor(Math.random() * 900000) + 100000;
  return `FRI-${n}`;
}

function load(): ProgressState {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProgressState>;
      return {
        ...EMPTY_PROGRESS,
        ...parsed,
        researchId: parsed.researchId ?? mintResearchId(),
        joinedAt: parsed.joinedAt ?? Date.now(),
        completedExperiments: parsed.completedExperiments ?? [],
        solvedCases: parsed.solvedCases ?? [],
        readDossiers: parsed.readDossiers ?? [],
        bustedMyths: parsed.bustedMyths ?? [],
        visitedLabs: parsed.visitedLabs ?? [],
        discoveries: parsed.discoveries ?? [],
      };
    }
  } catch {
    /* corrupted record, issue a fresh ID rather than trapping the researcher */
  }
  const fresh: ProgressState = {
    ...EMPTY_PROGRESS,
    researchId: mintResearchId(),
    joinedAt: Date.now(),
  };
  persist(fresh);
  return fresh;
}

function persist(next: ProgressState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode: progress stays in memory for this session */
  }
}

function snapshot(): ProgressState {
  if (state === null) state = load();
  return state;
}

function serverSnapshot(): ProgressState {
  return EMPTY_PROGRESS;
}

function emit(): void {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function mutate(fn: (draft: ProgressState) => ProgressState): void {
  const next = fn(snapshot());
  state = next;
  persist(next);
  emit();
}

function addTo(
  key: keyof Pick<
    ProgressState,
    | "completedExperiments"
    | "solvedCases"
    | "readDossiers"
    | "bustedMyths"
    | "visitedLabs"
    | "discoveries"
  >,
  id: string,
): void {
  mutate((draft) => {
    if (draft[key].includes(id)) return draft;
    return { ...draft, [key]: [...draft[key], id] };
  });
}

export const record = {
  completeExperiment: (id: string) => addTo("completedExperiments", id),
  solveCase: (id: string) => addTo("solvedCases", id),
  readDossier: (id: string) => addTo("readDossiers", id),
  bustMyth: (id: string) => addTo("bustedMyths", id),
  visitLab: (id: string) => addTo("visitedLabs", id),
  discover: (id: string) => addTo("discoveries", id),
  noteWhyDepth: (depth: number) =>
    mutate((draft) => (depth > draft.whyDepthRecord ? { ...draft, whyDepthRecord: depth } : draft)),
  reset: () => {
    mutate(() => ({ ...EMPTY_PROGRESS, researchId: mintResearchId(), joinedAt: Date.now() }));
  },
};

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

/** True only after hydration, so server and client markup agree on pass one. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function scoreOf(p: ProgressState): number {
  return (
    p.completedExperiments.length * 2 +
    p.solvedCases.length * 2 +
    p.readDossiers.length +
    p.bustedMyths.length +
    p.discoveries.length
  );
}

export function rankOf(p: ProgressState): ResearchRank {
  const score = scoreOf(p);
  return [...RANKS].reverse().find((r) => score >= r.min) ?? RANKS[0];
}

/** Entirely unscientific. That is the point. */
export function brainDamage(p: ProgressState): number {
  return Math.min(99, scoreOf(p) * 3 + p.whyDepthRecord * 4);
}
