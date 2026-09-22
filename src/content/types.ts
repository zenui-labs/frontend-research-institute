/**
 * Structured research content. Nothing here imports React: the whole archive is
 * plain data so it can move to a CMS, MDX pipeline or database later without
 * touching a single component.
 */

export type Difficulty =
  "CURIOUS" | "DEVELOPER" | "ENGINEER" | "RESEARCHER" | "SYSTEMS" | "EXPERIMENTAL";

export const DIFFICULTY_ORDER: Difficulty[] = [
  "CURIOUS",
  "DEVELOPER",
  "ENGINEER",
  "RESEARCHER",
  "SYSTEMS",
  "EXPERIMENTAL",
];

export const DIFFICULTY_LEVEL: Record<Difficulty, string> = {
  CURIOUS: "LEVEL 01",
  DEVELOPER: "LEVEL 02",
  ENGINEER: "LEVEL 03",
  RESEARCHER: "LEVEL 04",
  SYSTEMS: "LEVEL 05",
  EXPERIMENTAL: "LEVEL 06",
};

export type LabSlug =
  | "browser"
  | "css"
  | "javascript"
  | "react"
  | "performance"
  | "networking"
  | "security"
  | "accessibility"
  | "architecture"
  | "algorithms";

export type LabStatus = "OPERATIONAL" | "CALIBRATING" | "CLASSIFIED";

export type Laboratory = {
  slug: LabSlug;
  code: string;
  name: string;
  department: string;
  status: LabStatus;
  tagline: string;
  description: string;
  /** What the room physically looks like, drives the lab environment art. */
  environment: string;
  hazard: string;
  accent: "crt" | "amber" | "rust" | "signal" | "steel";
  topics: string[];
};

/** Keys into the client-side simulation registry. */
export type SimKey =
  | "stacking-context"
  | "stacking-creators"
  | "box-overflow"
  | "intrinsic-sizing"
  | "event-loop"
  | "coercion"
  | "closure-memory"
  | "render-pipeline"
  | "url-journey"
  | "react-render"
  | "react-keys"
  | "state-placement"
  | "perf-rescue"
  | "main-thread"
  | "network-lab"
  | "a11y-tree"
  | "dependency-graph"
  | "same-origin"
  | "complexity";

export type Reference = {
  label: string;
  source: string;
  url: string;
};

export type WhyNode = {
  /** The answer shown at this depth. */
  answer: string;
  /** What the WHY? button asks next. Omit to end the chain. */
  next?: WhyNode;
};

export type ContentBlock =
  | { type: "prose"; text: string }
  | {
      type: "code";
      lang: "css" | "html" | "js" | "jsx" | "ts" | "json" | "text" | "http";
      code: string;
      caption?: string;
      /** Shown in the editor chrome; defaults to a name derived from the language. */
      filename?: string;
      /** 1-based line numbers the surrounding prose refers to. */
      highlight?: number[];
    }
  | {
      type: "callout";
      variant: "note" | "warning" | "fact" | "model" | "myth" | "joke";
      title?: string;
      text: string;
    }
  | { type: "sim"; sim: SimKey; caption?: string }
  | { type: "steps"; title?: string; items: string[] }
  | { type: "table"; head: string[]; rows: string[][]; caption?: string }
  | { type: "why"; question: string; chain: WhyNode }
  | { type: "refs"; items: Reference[] };

export type ExperimentType =
  "INTERACTIVE" | "THOUGHT" | "SIMULATION" | "MEASUREMENT" | "INVESTIGATION";

export type Experiment = {
  id: string;
  number: number;
  slug: string;
  title: string;
  lab: LabSlug;
  difficulty: Difficulty;
  estimatedMinutes: number;
  type: ExperimentType;
  /** One-line hook used on cards and search results. */
  summary: string;
  question: string;
  hypothesis?: string;
  concepts: string[];
  prerequisites?: string[];
  sections: {
    experiment: ContentBlock[];
    observation: ContentBlock[];
    explanation: ContentBlock[];
    deeper?: ContentBlock[];
  };
  references: Reference[];
  related: string[];
};

export type CaseStatus = "UNSOLVED" | "OPEN" | "CLOSED";

export type CaseClue = {
  id: string;
  label: string;
  /** What the investigator observes when they pull this thread. */
  finding: string;
  /** Does this clue actually matter, or is it a red herring? */
  weight: "evidence" | "noise";
};

export type DetectiveCase = {
  id: string;
  number: number;
  slug: string;
  title: string;
  lab: LabSlug;
  difficulty: Difficulty;
  status: CaseStatus;
  brief: string;
  scene: ContentBlock[];
  clues: CaseClue[];
  suspects: { id: string; label: string; culprit: boolean; verdict: string }[];
  resolution: ContentBlock[];
  references: Reference[];
};

export type Myth = {
  id: string;
  number: number;
  slug: string;
  claim: string;
  verdict: "BUSTED" | "IT DEPENDS" | "OUTDATED" | "PARTLY TRUE";
  lab: LabSlug;
  difficulty: Difficulty;
  shortAnswer: string;
  body: ContentBlock[];
  references: Reference[];
};

export type Dossier = {
  id: string;
  number: number;
  slug: string;
  title: string;
  field: string;
  lab: LabSlug;
  difficulty: Difficulty;
  status: "ACTIVE" | "ARCHIVED" | "UNDER REVIEW";
  abstract: string;
  stats: { experiments: number; observations: number };
  sections: { heading: string; blocks: ContentBlock[] }[];
  references: Reference[];
};

export type Artifact = {
  id: string;
  slug: string;
  name: string;
  era: string;
  year: number;
  status: "ARCHIVED" | "EXTINCT" | "STILL BREATHING" | "MUTATED";
  summary: string;
  epitaph: string;
  legacy: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  /** Predicate inputs are kept primitive so badges stay data, not code. */
  requirement:
    | { kind: "experiments"; count: number }
    | { kind: "cases"; count: number }
    | { kind: "dossiers"; count: number }
    | { kind: "myths"; count: number }
    | { kind: "labs"; count: number }
    | { kind: "discoveries"; count: number }
    | { kind: "whyDepth"; count: number }
    | { kind: "experiment"; id: string };
};
