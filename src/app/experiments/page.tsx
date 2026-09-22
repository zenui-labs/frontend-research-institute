import type { Metadata } from "next";
import { DifficultyBadge } from "@/components/ui/badges";
import { EntryRow } from "@/components/ui/entry-row";
import { SectionHeading } from "@/components/ui/panel";
import { EXPERIMENTS, LABS } from "@/content";

export const metadata: Metadata = {
  title: "Experiments",
  description:
    "Interactive frontend experiments: stacking contexts, the event loop, intrinsic sizing, rendering pipeline invalidation, React reconciliation, Core Web Vitals and main-thread blocking.",
  alternates: { canonical: "/experiments" },
};

export default function ExperimentsPage() {
  const byLab = LABS.map((lab) => ({
    lab,
    items: EXPERIMENTS.filter((e) => e.lab === lab.slug),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6">
      <SectionHeading title="Experiments" />

      <div className="mt-14 space-y-16">
        {byLab.map(({ lab, items }) => (
          <section key={lab.slug}>
            <div className="mb-2 flex items-baseline justify-between gap-4 px-4">
              <h2 className="font-display text-xl font-semibold">{lab.name}</h2>
              <span className="text-steel-dim text-2xs font-mono">{lab.code}</span>
            </div>
            <ul>
              {items.map((experiment) => (
                <li key={experiment.id}>
                  <EntryRow
                    href={`/experiments/${experiment.slug}`}
                    title={experiment.title}
                    summary={experiment.summary}
                    right={
                      <>
                        <DifficultyBadge difficulty={experiment.difficulty} />
                        <span className="text-steel-dim text-2xs hidden font-mono sm:inline">
                          {experiment.estimatedMinutes}m
                        </span>
                      </>
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
