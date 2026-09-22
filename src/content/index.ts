import { EXPERIMENTS } from "./experiments";
import { CASES } from "./cases";
import { MYTHS } from "./myths";
import { DOSSIERS } from "./dossiers";
import { ARTIFACTS } from "./archive";
import { BADGES } from "./badges";
import { LABS, LAB_BY_SLUG, getLab } from "./labs";
import type { Experiment, LabSlug } from "./types";

export { EXPERIMENTS, CASES, MYTHS, DOSSIERS, ARTIFACTS, BADGES, LABS, LAB_BY_SLUG, getLab };
export * from "./types";

export const EXPERIMENT_BY_ID = new Map(EXPERIMENTS.map((e) => [e.id, e]));
export const EXPERIMENT_BY_SLUG = new Map(EXPERIMENTS.map((e) => [e.slug, e]));
export const CASE_BY_SLUG = new Map(CASES.map((c) => [c.slug, c]));
export const MYTH_BY_SLUG = new Map(MYTHS.map((m) => [m.slug, m]));
export const DOSSIER_BY_SLUG = new Map(DOSSIERS.map((d) => [d.slug, d]));

export function experimentsInLab(lab: LabSlug): Experiment[] {
  return EXPERIMENTS.filter((e) => e.lab === lab);
}

export function casesInLab(lab: LabSlug) {
  return CASES.filter((c) => c.lab === lab);
}

export function mythsInLab(lab: LabSlug) {
  return MYTHS.filter((m) => m.lab === lab);
}

export function dossiersInLab(lab: LabSlug) {
  return DOSSIERS.filter((d) => d.lab === lab);
}

export function relatedExperiments(experiment: Experiment): Experiment[] {
  return experiment.related
    .map((id) => EXPERIMENT_BY_ID.get(id))
    .filter((e): e is Experiment => Boolean(e));
}

/** Deterministic "experiment of the day", same for everyone, rotates daily. */
export function experimentOfTheDay(now = new Date()): Experiment {
  const dayNumber = Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86_400_000,
  );
  return EXPERIMENTS[dayNumber % EXPERIMENTS.length];
}

export const INSTITUTE_STATS = {
  experiments: EXPERIMENTS.length,
  cases: CASES.length,
  myths: MYTHS.length,
  dossiers: DOSSIERS.length,
  artifacts: ARTIFACTS.length,
  labs: LABS.length,
  operationalLabs: LABS.filter((l) => l.status === "OPERATIONAL").length,
  /** Fictional. Obviously. */
  researchers: 8421,
};
