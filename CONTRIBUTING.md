# Contributing

Thank you for considering it. This project is a technical publication as much as an
application, so contributions are reviewed on accuracy first and craft second.

## What is most useful

1. **Corrections.** A specification changed, an engine shipped a new heuristic, a measurement
   is no longer representative, or a claim is simply wrong. Open an issue with the source and
   the correction; these are merged fastest.
2. **New experiments.** A question with a mechanism behind it and an instrument that lets
   somebody discover the answer rather than be told it.
3. **New benches.** An interactive model for an existing experiment that currently only has
   prose.
4. **Accessibility and performance fixes.** A bench that traps focus, a control without a
   label, a route that ships more JavaScript than it needs.

## What is not a good fit

- Content that restates documentation without adding an experiment or a measurement
- Claims that cannot be cited or reproduced
- Visual decoration that carries no information
- New dependencies where the platform already provides the capability

## Standard of evidence

Every claim must fall into one of three categories, and must be labelled as such where the
distinction matters:

| Label | Meaning |
| --- | --- |
| Documented fact | Stated in a specification or engine documentation, or reproducible in every major browser |
| Simplified model | A teaching abstraction, directionally correct and deliberately incomplete |
| Interpretation | A reading of the evidence that reasonable engineers may dispute |

If a bench approximates browser behaviour, say so in its `note` prop. Never present a
simulation as how every engine is implemented.

## Local setup

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm run lint
npm run typecheck
npm run build
npm run format
```

## Adding an experiment

1. Add the object to the right file in `src/content/experiments/`, or create a new one and
   register it in `src/content/experiments/index.ts`.
2. Give it the next free `number`, a stable `id` and a descriptive `slug`.
3. Write the sections in order: `experiment`, `observation`, `explanation`, and optionally
   `deeper`. The reading page renders these as Method, What we observed, Why it happens and
   Further research.
4. Cite at least two references. Primary sources are preferred: specifications, engine
   documentation, engine blogs.
5. Link related experiments with the `related` array.

## Adding a bench

1. Create `src/components/sims/your-bench.tsx` as a client component.
2. Compose it from `SimFrame`, `ControlGroup`, `Slider`, `Segmented`, `Readout` and
   `MechanicalSwitch` so it matches every other instrument.
3. Add the key to `SimKey` in `src/content/types.ts` and register the dynamic import in
   `src/components/sims/sim-mount.tsx`. Benches are always client-only and code-split.
4. Call `observe()` from `src/lib/observation-log.ts` on meaningful state changes so the
   laboratory console records the session.
5. Reference the bench from an experiment with a `sim` content block.

## Writing style

- British English
- No em dashes; use a comma, a semicolon, a colon or a full stop
- No exclamation marks in research content
- Humour belongs in the world-building, never in a technical claim
- Prefer the mechanism over the summary

## Review criteria

A pull request is merged when it is accurate, cited, keyboard accessible, passes lint,
typecheck and build, and does not add decoration that carries no information.

## Reporting problems

Use the issue templates. For anything with a security dimension, follow
[SECURITY.md](./SECURITY.md) instead of opening a public issue.

## Code of conduct

Participation is covered by the [Code of Conduct](./CODE_OF_CONDUCT.md).
