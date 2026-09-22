import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/panel";
import { Reveal } from "@/components/ui/reveal";
import { DOSSIERS, EXPERIMENTS, INSTITUTE_STATS, LABS, experimentOfTheDay } from "@/content";
import { REPO } from "@/lib/site";
import { GithubMark } from "@/components/shell/logo";

export const metadata: Metadata = {
  title: "About the institute",
  description:
    "Why the Frontend Research Institute exists, who it is for, how its claims are sourced and verified, and how the site itself is built.",
  alternates: { canonical: "/about" },
};

const AUDIENCE = [
  {
    title: "The developer who ships it anyway",
    body: "You fixed the bug by adding a z-index and moving on. It worked. You still do not know why the first fix failed, and that gap is going to cost you again next quarter.",
  },
  {
    title: "The engineer between levels",
    body: "You can build the feature. The interview asks what happens between a keypress and a pixel, and you realise the answer you have is a slogan rather than a mechanism.",
  },
  {
    title: "The senior who wants the primary source",
    body: "You already know the rules. You want the specification text, the engine behaviour behind it, and an honest note about where the simplification stops being true.",
  },
  {
    title: "Anyone teaching this",
    body: "Every bench here is a demonstration you can operate in front of someone. Copy the idea, steal the framing, argue with the conclusions.",
  },
];

const PRINCIPLES = [
  {
    term: "Documented fact",
    definition:
      "Stated in a specification, in an engine's own documentation, or reproducible in every major browser.",
  },
  {
    term: "Simplified model",
    definition:
      "A teaching abstraction. Directionally correct, deliberately incomplete, and labelled as such wherever it appears.",
  },
  {
    term: "Interpretation",
    definition:
      "The institute's reading of the evidence. Reasonable engineers disagree here, and saying so is part of the method.",
  },
];

export default function AboutPage() {
  const daily = experimentOfTheDay();

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6">
      <Reveal>
        <p className="label-tech mb-5">Administration</p>
        <h1 className="font-display max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
          A fictional institute, built to teach real mechanisms.
        </h1>
        <p className="text-steel mt-6 max-w-2xl text-lg">
          The world-building is a device. The engineering is the point: everything here is meant to
          survive being checked against a specification.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <dl className="border-line mt-12 grid gap-8 border-y py-6 sm:grid-cols-4">
          {[
            ["Experiments", EXPERIMENTS.length],
            ["Laboratories", LABS.length],
            ["Dossiers", DOSSIERS.length],
            ["Artifacts", INSTITUTE_STATS.artifacts],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <dt className="label-tech">{label}</dt>
              <dd className="font-display mt-1.5 text-2xl font-semibold tabular-nums">
                {String(value).padStart(2, "0")}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal delay={60} className="mt-20 block">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-[210px_minmax(0,68ch)]">
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <h2 className="font-display text-2xl leading-tight font-semibold text-balance">
              Why it exists
            </h2>
            <p className="text-steel-dim mt-3 text-sm leading-relaxed">
              The gap between building something and being able to explain it.
            </p>
          </div>
          <div className="text-steel space-y-5 text-base leading-relaxed">
            <p>
              Most frontend material optimises for getting something working. That is a reasonable
              goal, and it produces engineers who can build almost anything and explain almost
              nothing. The failure shows up later: a layout that breaks in one locale, a page that
              is fast on the developer&apos;s laptop and unusable on a three-year-old phone, a
              component that re-renders a thousand nodes because state was placed two levels too
              high.
            </p>
            <p>
              None of those are exotic. They are all consequences of models, the cascade, the event
              loop, the rendering pipeline, reconciliation, that are documented in public and taught
              almost nowhere. This institute exists to close that gap by making the models operable:
              not described, not diagrammed, but pushed until they break in front of you.
            </p>
            <p>
              The second reason is tone. Technical writing about the web tends to be either a
              tutorial or a lecture. A laboratory is a better metaphor, because it admits that the
              interesting part is the experiment you were not expecting to run.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={60} className="mt-20 block">
        <SectionHeading title="Who it is for" />
        <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {AUDIENCE.map((item) => (
            <li key={item.title} className="border-line border-t pt-5">
              <h3 className="font-display text-xl font-semibold">{item.title}</h3>
              <p className="text-steel mt-2.5 text-sm leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={60} className="mt-20 block">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-[210px_minmax(0,68ch)]">
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <h2 className="font-display text-2xl leading-tight font-semibold text-balance">
              Who made it
            </h2>
            <p className="text-steel-dim mt-3 text-sm leading-relaxed">
              One engineer, writing in the open, and happy to be corrected.
            </p>
          </div>
          <div className="text-steel space-y-5 text-base leading-relaxed">
            <p>
              The institute is written and maintained by a single frontend engineer, with the
              content, benches and interface all built in the open as one project. There is no
              editorial team behind the nameplate, the departments, hazard labels and personnel
              files are set dressing, and the research notes are one person&apos;s reading of the
              specifications.
            </p>
            <p>
              That matters for how you should treat it. Where a claim is a documented fact, it is
              cited. Where it is a simplification, the bench says so. Where it is an opinion about
              engineering practice, it is written as an opinion, and you are welcome to disagree
              with it, preferably after running the experiment.
            </p>
            <p>
              Corrections are the most valuable contribution anyone can make. A specification
              changes, an engine ships a new heuristic, a measurement stops being representative:
              all of that ages the content, and none of it ages the method.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={60} className="mt-20 block">
        <SectionHeading title="Standard of evidence" />
        <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-3">
          {PRINCIPLES.map((item) => (
            <div key={item.term} className="border-line border-t pt-5">
              <dt className="font-display text-crt text-base font-semibold">{item.term}</dt>
              <dd className="text-steel mt-2.5 text-sm leading-relaxed">{item.definition}</dd>
            </div>
          ))}
        </dl>
        <p className="text-steel mt-6 max-w-2xl text-base leading-relaxed">
          Where a simulation approximates a browser, the bench says so in its own footer. Nothing
          here claims to be how every engine is implemented, because no such single answer exists.
          Chromium, Gecko and WebKit disagree in the details, and all three change between releases.
        </p>
      </Reveal>

      <Reveal delay={60} className="mt-20 block">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold">How it is built</h2>
            <p className="text-steel mt-4 text-base leading-relaxed">
              Next.js App Router, TypeScript, Tailwind CSS. All research content is structured data
              kept separate from the components that render it, so the archive can move to a content
              pipeline without touching the interface. Every bench is code-split and client-only, so
              a page of reading pays nothing for a simulation you never scrolled to.
            </p>
            <p className="text-steel mt-4 text-base leading-relaxed">
              A site about frontend performance that was slow would be the funniest possible
              failure, so the constraints are taken personally.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold">Accessibility</h2>
            <ul className="text-steel mt-4 space-y-2.5 text-base leading-relaxed">
              <li>
                Every bench is operable by keyboard, with visible focus and labelled controls.
              </li>
              <li>
                <code className="text-crt font-mono text-sm">prefers-reduced-motion</code> disables
                reveals, ambient drift and every animated transition.
              </li>
              <li>Sound is off by default and never plays without an explicit interaction.</li>
              <li>No information is available only through colour, motion or animation.</li>
            </ul>
          </div>
        </div>
      </Reveal>

      <Reveal delay={60} className="mt-20 block">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-[210px_minmax(0,68ch)]">
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <h2 className="font-display text-2xl leading-tight font-semibold text-balance">
              Open source
            </h2>
            <p className="text-steel-dim mt-3 text-sm leading-relaxed">
              MIT licensed, corrections welcome, evidence required.
            </p>
          </div>
          <div className="space-y-5 text-base leading-relaxed">
            <p className="text-steel">
              The whole institute is public: the interface, the benches and every word of the
              research content, which lives as typed data rather than as markup. Nothing in the
              content layer imports React, so the archive can move to a different pipeline without
              touching a component.
            </p>
            <p className="text-steel">
              Corrections are the most valuable contribution. A specification changes, an engine
              ships a new heuristic, a measurement stops being representative: all of that ages the
              content, and none of it ages the method. Proposals for new experiments are reviewed on
              whether there is a mechanism underneath and an instrument that lets somebody discover
              it, rather than be told.
            </p>

            <ul className="grid gap-3 pt-2 sm:grid-cols-2">
              {[
                {
                  href: REPO.root,
                  label: "Browse the source",
                  note: "Next.js, TypeScript, Tailwind",
                },
                {
                  href: REPO.contributing,
                  label: "Contributing guide",
                  note: "Content model and review criteria",
                },
                {
                  href: REPO.correction,
                  label: "Report a correction",
                  note: "Cite the source, we merge it fast",
                },
                {
                  href: REPO.newExperiment,
                  label: "Propose an experiment",
                  note: "Question, mechanism, instrument",
                },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="border-line hover:border-crt/40 group block rounded-[16px] border px-4 py-3.5 transition-colors"
                  >
                    <span className="text-bone group-hover:text-crt flex items-center gap-2 text-sm font-medium transition-colors">
                      <GithubMark className="h-3.5 w-3.5" />
                      {item.label}
                    </span>
                    <span className="text-steel-dim mt-1 block text-xs">{item.note}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      <Reveal delay={60} className="mt-24 block">
        <section className="border-line bg-ink-850 relative overflow-hidden rounded-[24px] border">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(94,230,160,0.16),transparent_70%)]"
          />

          <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
            <div>
              <p className="text-steel-dim text-2xs font-medium tracking-[0.14em] uppercase">
                Start here
              </p>
              <h2 className="font-display mt-4 max-w-[20ch] text-3xl leading-tight font-semibold text-balance">
                Run one bench before you decide whether any of this is worth your time.
              </h2>
              <p className="text-steel mt-4 max-w-lg text-base leading-relaxed">
                Every experiment states a question, hands you the instrument, and only then explains
                what you observed.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/experiments"
                  className="bg-crt text-ink-950 inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium transition-colors hover:bg-[#7bf0b4]"
                >
                  Browse all {EXPERIMENTS.length} experiments <ArrowRight size={14} aria-hidden />
                </Link>
                <Link
                  href={`/experiments/${daily.slug}/lab`}
                  className="border-line text-steel hover:border-line-bright hover:text-bone inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm transition-colors"
                >
                  Enter a laboratory
                </Link>
                <a
                  href={REPO.root}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="border-line text-steel hover:border-line-bright hover:text-bone inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm transition-colors"
                >
                  <GithubMark className="h-4 w-4" />
                  Star the repository
                </a>
              </div>
            </div>

            <Link
              href={`/experiments/${daily.slug}`}
              className="border-line bg-ink-800 hover:border-crt/40 group block rounded-[24px] border p-6 transition-colors"
            >
              <p className="text-steel-dim text-2xs font-medium tracking-[0.14em] uppercase">
                Experiment of the day
              </p>
              <p className="font-display group-hover:text-crt mt-3 text-lg leading-snug font-semibold transition-colors">
                {daily.title}
              </p>
              <p className="text-steel mt-2.5 line-clamp-2 text-sm leading-relaxed">
                {daily.summary}
              </p>
              <p className="text-steel-dim mt-5 flex items-center gap-3 text-xs">
                <span>{daily.difficulty.toLowerCase()}</span>
                <span aria-hidden className="bg-line-bright h-px w-3" />
                <span>{daily.estimatedMinutes} min</span>
              </p>
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
