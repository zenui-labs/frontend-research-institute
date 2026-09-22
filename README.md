# Frontend Research Institute

**Investigate the web. Break things. Understand why.**

A fictional research institute with real engineering content. Twenty-two interactive
experiments, five research dossiers, three case files and a myth archive covering browser
rendering, CSS layout, the JavaScript event loop, React reconciliation, performance,
networking, security, accessibility, architecture and applied complexity.

Every claim is either cited against a specification, reproducible in a bench on the site, or
explicitly labelled as a simplified model.

## Why it exists

Most frontend material optimises for getting something working, which produces engineers who
can build almost anything and explain almost nothing. This project closes that gap by making
the underlying models operable: not described, not diagrammed, but pushed until they break in
front of you.

## Two modes

**Research mode** is a technical publication: a context rail, a reading column held at an
editorial measure, a scroll-spy table of contents, and numbered references.

**Experiment mode** is a laboratory workstation: a briefing with a prediction step, an
instrument you operate, and an observation log that records what you did and what the browser
model did in response.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS v4, design tokens declared in `src/app/globals.css`
- No UI framework, no animation library, no 3D dependency
- Benches are plain React, code-split and client-only

## Getting started

```bash
npm install
npm run dev
```

The site runs at `http://localhost:3000`.

```bash
npm run build      # production build, prerenders every route
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run format     # prettier --write
```

## Project structure

```
src/
  app/                 routes: labs, experiments, detective, myths, research, archives
    experiments/[slug]/       research document
    experiments/[slug]/lab/   laboratory workstation
  components/
    research/          document layout, table of contents
    experiments/       lab shell, observation log
    sims/              the benches, one file each
    ui/                cards, code blocks, callouts, controls
  content/             all research content as typed data
  lib/                 progress, sound, observation log, site config
```

## Content is data

Nothing in `src/content` imports React. An experiment is a typed object, so the archive can
move to a CMS or an MDX pipeline without touching a component.

```ts
export const MY_EXPERIMENT: Experiment = {
  id: "z-index-fails",
  number: 1,
  slug: "why-z-index-999999-loses",
  title: "Why can z-index: 999999 lose?",
  lab: "css",
  difficulty: "ENGINEER",
  estimatedMinutes: 9,
  type: "INTERACTIVE",
  summary: "...",
  question: "...",
  hypothesis: "...",
  concepts: ["stacking context", "painting order"],
  sections: {
    experiment: [{ type: "sim", sim: "stacking-context" }],
    observation: [{ type: "prose", text: "..." }],
    explanation: [{ type: "callout", variant: "fact", text: "..." }],
  },
  references: [{ label: "The stacking context", source: "MDN", url: "https://..." }],
  related: ["stacking-creators"],
};
```

Content blocks available: `prose`, `code`, `callout`, `sim`, `steps`, `table`, `why`, `refs`.

## Standard of evidence

Three labels, used consistently:

| Label | Meaning |
| --- | --- |
| Documented fact | Stated in a specification or engine documentation, or reproducible in every major browser |
| Simplified model | A teaching abstraction, directionally correct and deliberately incomplete |
| Interpretation | A reading of the evidence that reasonable engineers may dispute |

A bench that approximates a browser says so in its own footer.

## Commitments

- Every bench is keyboard operable, with visible focus and labelled controls
- `prefers-reduced-motion` disables reveals, ambient motion and transitions
- Sound is off by default and never plays without an explicit interaction
- No information is conveyed by colour or motion alone
- Progress lives in `localStorage`; there are no accounts and no analytics on your reading

## Contributing

Corrections are the most valuable contribution: specifications change, engines ship new
heuristics, and measurements stop being representative. See
[CONTRIBUTING.md](./CONTRIBUTING.md) for the content model, the review criteria and the local
workflow.

## License

[MIT](./LICENSE)
