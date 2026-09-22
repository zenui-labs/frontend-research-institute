import type { Metadata } from "next";
import { DossierCard } from "@/components/ui/cards";
import { SectionHeading } from "@/components/ui/panel";
import { DOSSIERS } from "@/content";

export const metadata: Metadata = {
  title: "Research Dossiers",
  description:
    "Long-form frontend research: the hidden cost of JavaScript, compositing and the layer economy, and Fiber's interruptible render, with method, findings, limitations and references.",
  alternates: { canonical: "/research" },
};

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6">
      <SectionHeading title="Dossiers" />

      <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {DOSSIERS.map((dossier) => (
          <li key={dossier.id} className="flex">
            <DossierCard dossier={dossier} />
          </li>
        ))}
      </ul>

      <section className="border-line bg-ink-850 shadow-panel mt-14 rounded-[12px] border p-6">
        <p className="label-tech mb-4">Standard of evidence</p>
        <dl className="grid gap-6 sm:grid-cols-3">
          {[
            [
              "Documented fact",
              "Stated in a specification, an engine's documentation, or reproducible in every major browser.",
            ],
            [
              "Simplified model",
              "A teaching abstraction. Directionally correct, deliberately incomplete, and labelled as such.",
            ],
            [
              "Interpretation",
              "The institute's reading of the evidence. Reasonable engineers may disagree, and sometimes do.",
            ],
          ].map(([term, definition]) => (
            <div key={term}>
              <dt className="text-2xs text-crt font-medium tracking-[0.08em] uppercase">{term}</dt>
              <dd className="text-steel-dim mt-2 text-sm leading-relaxed">{definition}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
