import type { Badge } from "./types";

export const BADGES: Badge[] = [
  {
    id: "css-archaeologist",
    name: "CSS Archaeologist",
    description: "Excavated three CSS experiments without reaching for !important.",
    requirement: { kind: "experiments", count: 3 },
  },
  {
    id: "dom-detective",
    name: "DOM Detective",
    description: "Closed a case file using evidence rather than vibes.",
    requirement: { kind: "cases", count: 1 },
  },
  {
    id: "layout-whisperer",
    name: "Layout Whisperer",
    description: "Understands why the box is that size. Genuinely.",
    requirement: { kind: "experiment", id: "intrinsic-sizing" },
  },
  {
    id: "promise-survivor",
    name: "Promise Survivor",
    description: "Predicted the output order and lived to tell colleagues about it.",
    requirement: { kind: "experiment", id: "promise-vs-timeout" },
  },
  {
    id: "main-thread-survivor",
    name: "Main Thread Survivor",
    description: "Blocked the main thread on purpose, then unblocked it. Measured both.",
    requirement: { kind: "experiment", id: "main-thread" },
  },
  {
    id: "render-detective",
    name: "React Render Detective",
    description: "Can name all four reasons a component rendered, under pressure.",
    requirement: { kind: "experiment", id: "why-render" },
  },
  {
    id: "browser-internals",
    name: "Browser Internals Researcher",
    description: "Traced a pixel from URL to screen without skipping a stage.",
    requirement: { kind: "experiment", id: "render-invalidation" },
  },
  {
    id: "accessibility-inspector",
    name: "Accessibility Inspector",
    description: "Read the other tree, the one the browser derived from your markup.",
    requirement: { kind: "experiment", id: "invisible-dom" },
  },
  {
    id: "network-cartographer",
    name: "Network Cartographer",
    description: "Mapped every round trip between a keypress and a byte.",
    requirement: { kind: "experiment", id: "network-distance" },
  },
  {
    id: "dependency-criminal",
    name: "Dependency Criminal",
    description: "Weighed the graph. Felt something. Removed a package.",
    requirement: { kind: "experiment", id: "dependency-weight" },
  },
  {
    id: "myth-buster",
    name: "Institutional Sceptic",
    description: "Investigated three myths instead of repeating them at standup.",
    requirement: { kind: "myths", count: 3 },
  },
  {
    id: "rabbit-hole",
    name: "Rabbit Hole Spelunker",
    description: "Pressed WHY? until the institute ran out of answers.",
    requirement: { kind: "whyDepth", count: 4 },
  },
  {
    id: "tourist",
    name: "Facility Tourist",
    description: "Visited five laboratories. Touched things in at least four.",
    requirement: { kind: "labs", count: 5 },
  },
  {
    id: "librarian",
    name: "Dossier Librarian",
    description: "Read two research dossiers, including the limitations section.",
    requirement: { kind: "dossiers", count: 2 },
  },
  {
    id: "hydration-investigator",
    name: "Hydration Investigator",
    description: "Understood why the page was built twice.",
    requirement: { kind: "dossiers", count: 1 },
  },
];
