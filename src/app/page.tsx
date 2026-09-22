import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroInstrument } from "@/components/home/hero-instrument";
import { ClickJourney } from "@/components/home/click-journey";
import { Investigations } from "@/components/home/investigations";
import { SectionHeading } from "@/components/ui/panel";
import { RetroLink } from "@/components/ui/retro-button";
import { DossierCard, LabCard, LabRow } from "@/components/ui/cards";
import { EntryRow } from "@/components/ui/entry-row";
import { DifficultyBadge } from "@/components/ui/badges";
import { cn } from "@/lib/cn";
import { ResearchIdCard } from "@/components/progress/research-id";
import { Reveal } from "@/components/ui/reveal";
import { DOSSIERS, EXPERIMENTS, INSTITUTE_STATS, LABS } from "@/content";

const MVP_LABS = ["browser", "css", "javascript", "react", "performance"];

export default function HomePage() {
  const featured = EXPERIMENTS.slice(0, 6);
  const labs = LABS.filter((lab) => MVP_LABS.includes(lab.slug));
  const otherLabs = LABS.filter((lab) => !MVP_LABS.includes(lab.slug));

  return (
    <>
      <section className="relative isolate overflow-hidden">
        {/* Curved bay: concentric arcs that wrap the left-hand column */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="border-line/70 absolute top-1/2 -left-[38%] h-[150vh] w-[110vw] -translate-y-1/2 rounded-[50%] border bg-[radial-gradient(60%_60%_at_30%_40%,rgba(94,230,160,0.07),transparent_70%)] lg:-left-[52%] lg:w-[95vw]" />
          <div className="border-line/50 absolute top-1/2 -left-[46%] h-[122vh] w-[92vw] -translate-y-1/2 rounded-[50%] border lg:-left-[60%] lg:w-[80vw]" />
          <div className="border-line/30 absolute top-1/2 -left-[54%] h-[96vh] w-[74vw] -translate-y-1/2 rounded-[50%] border lg:-left-[68%] lg:w-[64vw]" />
        </div>

        <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-4 pt-14 pb-20 sm:px-6 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-24 lg:py-10">
          <div className="relative">
            <p
              className="rise label-tech border-line bg-ink-850/70 mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur"
              style={{ animationDelay: "40ms" }}
            >
              <span className="led bg-crt inline-block h-1.5 w-1.5 rounded-full" />
              Department of Browser Behaviour
            </p>

            <h1
              className="rise font-display text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl"
              style={{ animationDelay: "90ms" }}
            >
              Investigate the web.
              <br />
              Break things.
              <br />
              <span className="text-crt text-glow">Understand why.</span>
            </h1>

            <p
              className="rise text-steel mt-6 max-w-[30rem] text-lg"
              style={{ animationDelay: "160ms" }}
            >
              A laboratory for the parts of frontend engineering nobody explained properly: stacking
              contexts, the event loop, the rendering pipeline, and the true cost of everything you
              ship.
            </p>

            <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "230ms" }}>
              <RetroLink href="/experiments" variant="primary">
                Enter the lab <ArrowRight size={14} aria-hidden />
              </RetroLink>
              <RetroLink href="/labs">Browse laboratories</RetroLink>
            </div>
          </div>

          <div className="relative w-full lg:pl-6">
            <HeroInstrument />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-20 sm:px-6">
        <Reveal>
          <SectionHeading
            title="Currently under investigation"
            right={
              <RetroLink href="/experiments" size="sm">
                All {INSTITUTE_STATS.experiments} experiments <ArrowRight size={13} aria-hidden />
              </RetroLink>
            }
          />
        </Reveal>
        <ul className="border-line mt-10 border-t">
          {featured.map((experiment, i) => (
            <Reveal as="li" key={experiment.id} delay={i * 50}>
              <EntryRow
                href={`/experiments/${experiment.slug}`}
                title={experiment.title}
                summary={experiment.summary}
                right={
                  <>
                    <DifficultyBadge difficulty={experiment.difficulty} />
                    <span className="text-2xs text-steel-dim hidden font-mono sm:inline">
                      {experiment.estimatedMinutes}m
                    </span>
                  </>
                }
              />
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pb-20 sm:px-6">
        <Reveal>
          <ClickJourney />
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-20 sm:px-6">
        <Reveal>
          <SectionHeading title="Laboratories" />
        </Reveal>
        <ul className="mt-10 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {labs.map((lab, i) => (
            <Reveal
              as="li"
              key={lab.slug}
              delay={i * 70}
              className={cn("flex", i < 2 ? "lg:col-span-3" : "lg:col-span-2")}
            >
              <LabCard lab={lab} featured={i < 2} />
            </Reveal>
          ))}
        </ul>

        <Reveal delay={120}>
          <div className="border-line mt-5 overflow-hidden rounded-[24px] border">
            <p className="label-tech border-line border-b px-5 py-3">Under calibration</p>
            <ul className="divide-line divide-y">
              {otherLabs.map((lab) => (
                <li key={lab.slug}>
                  <LabRow lab={lab} />
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-20 sm:px-6">
        <Reveal>
          <SectionHeading title="Two ways to be wrong" />
        </Reveal>
        <Reveal delay={80} className="mt-10 block">
          <Investigations />
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-20 sm:px-6">
        <Reveal>
          <SectionHeading
            title="Research dossiers"
            right={
              <RetroLink href="/research" size="sm">
                Research library <ArrowRight size={13} aria-hidden />
              </RetroLink>
            }
          />
        </Reveal>
        <ul className="mt-10 grid auto-rows-fr gap-5 md:grid-cols-3">
          {DOSSIERS.map((dossier, i) => (
            <Reveal as="li" key={dossier.id} delay={i * 80} className="flex">
              <DossierCard dossier={dossier} />
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-20 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
          <Reveal className="flex">
            <div className="flex w-full flex-col justify-between gap-10">
              <p className="font-display max-w-2xl text-3xl leading-[1.25] font-semibold text-balance">
                Stop memorising. Start investigating. The browser is doing far more than you think,
                and most of it is documented, just not anywhere you were looking.
              </p>
              <ul className="grid gap-8 sm:grid-cols-3">
                {[
                  ["Run the experiment", "Every claim has a bench you can operate."],
                  ["Read the source", "Specifications and engine docs, cited in full."],
                  ["Keep the receipts", "Simplified models are labelled as models."],
                ].map(([label, text]) => (
                  <li key={label}>
                    <p className="font-display text-bone text-base font-semibold">{label}</p>
                    <p className="text-steel mt-1.5 text-sm leading-relaxed">{text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={90} className="space-y-4">
            <ResearchIdCard compact />
            <Link
              href="/archives"
              className="card-quiet hover:border-line-bright hover:bg-ink-800 flex items-center justify-between gap-3 px-5 py-4"
            >
              <span>
                <span className="label-tech block">Web archaeology</span>
                <span className="font-display mt-1.5 block text-base font-semibold">
                  The browser museum is open
                </span>
              </span>
              <ArrowRight size={16} aria-hidden className="text-steel-dim shrink-0" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
