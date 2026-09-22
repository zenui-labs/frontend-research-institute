import { ARTIFACTS, CASES, DOSSIERS, EXPERIMENTS, LABS, MYTHS } from "./index";
import type { Difficulty } from "./types";

export type SearchKind = "EXPERIMENT" | "CASE" | "MYTH" | "DOSSIER" | "ARTIFACT" | "LAB";

export type SearchRecord = {
  id: string;
  kind: SearchKind;
  title: string;
  href: string;
  summary: string;
  difficulty?: Difficulty;
  lab?: string;
  minutes?: number;
  related: string[];
  haystack: string;
};

function normalise(value: string): string {
  return value.toLowerCase();
}

export const SEARCH_INDEX: SearchRecord[] = [
  ...EXPERIMENTS.map((e) => ({
    id: e.id,
    kind: "EXPERIMENT" as const,
    title: e.title,
    href: `/experiments/${e.slug}`,
    summary: e.summary,
    difficulty: e.difficulty,
    lab: e.lab,
    minutes: e.estimatedMinutes,
    related: e.concepts,
    haystack: normalise(
      [e.title, e.summary, e.question, e.concepts.join(" "), e.lab, e.difficulty].join(" "),
    ),
  })),
  ...CASES.map((c) => ({
    id: c.id,
    kind: "CASE" as const,
    title: c.title,
    href: `/detective/${c.slug}`,
    summary: c.brief,
    difficulty: c.difficulty,
    lab: c.lab,
    related: c.suspects.map((s) => s.label),
    haystack: normalise([c.title, c.brief, c.lab, c.difficulty].join(" ")),
  })),
  ...MYTHS.map((m) => ({
    id: m.id,
    kind: "MYTH" as const,
    title: m.claim,
    href: `/myths/${m.slug}`,
    summary: m.shortAnswer,
    difficulty: m.difficulty,
    lab: m.lab,
    related: [m.verdict],
    haystack: normalise([m.claim, m.shortAnswer, m.verdict, m.lab].join(" ")),
  })),
  ...DOSSIERS.map((d) => ({
    id: d.id,
    kind: "DOSSIER" as const,
    title: d.title,
    href: `/research/${d.slug}`,
    summary: d.abstract,
    difficulty: d.difficulty,
    lab: d.lab,
    related: [d.field],
    haystack: normalise([d.title, d.abstract, d.field, d.lab].join(" ")),
  })),
  ...ARTIFACTS.map((a) => ({
    id: a.id,
    kind: "ARTIFACT" as const,
    title: a.name,
    href: `/archives#${a.slug}`,
    summary: a.summary,
    related: [a.era, String(a.year)],
    haystack: normalise([a.name, a.summary, a.era, a.epitaph, String(a.year)].join(" ")),
  })),
  ...LABS.map((l) => ({
    id: l.slug,
    kind: "LAB" as const,
    title: l.name,
    href: `/labs/${l.slug}`,
    summary: l.tagline,
    related: l.topics,
    haystack: normalise([l.name, l.tagline, l.description, l.topics.join(" ")].join(" ")),
  })),
];

export function searchInstitute(query: string, limit = 12): SearchRecord[] {
  const q = normalise(query.trim());
  if (q.length < 2) return [];
  const terms = q.split(/\s+/);

  return SEARCH_INDEX.map((record) => {
    let score = 0;
    for (const term of terms) {
      if (!record.haystack.includes(term)) return { record, score: -1 };
      score += 1;
      if (normalise(record.title).includes(term)) score += 3;
      if (record.related.some((r) => normalise(r).includes(term))) score += 2;
    }
    return { record, score };
  })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((hit) => hit.record);
}
