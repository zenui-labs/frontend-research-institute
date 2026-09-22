import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LabEnvironment } from "@/components/labs/lab-environment";
import { TrackLabVisit } from "@/components/progress/record-buttons";
import { SimMount } from "@/components/sims/sim-mount";
import { MetaTag, StatusChip } from "@/components/ui/badges";
import { CaseCard, DossierCard, ExperimentCard, MythCard } from "@/components/ui/cards";
import { HazardStrip, SectionHeading } from "@/components/ui/panel";
import { LABS, casesInLab, dossiersInLab, experimentsInLab, getLab, mythsInLab } from "@/content";
import type { LabSlug, SimKey } from "@/content/types";

/** Labs without a dedicated experiment still have a bench you can operate. */
const LAB_BENCH: Partial<Record<LabSlug, SimKey>> = {
  networking: "network-lab",
  accessibility: "a11y-tree",
  architecture: "dependency-graph",
  security: "same-origin",
  algorithms: "complexity",
};

export function generateStaticParams() {
  return LABS.filter((lab) => lab.status !== "CLASSIFIED").map((lab) => ({ slug: lab.slug }));
}

export async function generateMetadata({ params }: PageProps<"/labs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const lab = getLab(slug);
  if (!lab) return { title: "Laboratory not found" };
  return {
    title: lab.name,
    description: `${lab.tagline} ${lab.description}`,
    alternates: { canonical: `/labs/${lab.slug}` },
    openGraph: { title: lab.name, description: lab.tagline, url: `/labs/${lab.slug}` },
  };
}

export default async function LabPage({ params }: PageProps<"/labs/[slug]">) {
  const { slug } = await params;
  const lab = getLab(slug);
  if (!lab) notFound();

  const experiments = experimentsInLab(lab.slug);
  const cases = casesInLab(lab.slug);
  const myths = mythsInLab(lab.slug);
  const dossiers = dossiersInLab(lab.slug);
  const bench = LAB_BENCH[lab.slug];

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6">
      <TrackLabVisit slug={lab.slug} />

      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/labs"
          className="text-steel-dim hover:text-bone inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft size={13} aria-hidden /> Facility map
        </Link>
      </nav>

      <header className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-center">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="label-tech">{lab.code}</span>
            <StatusChip status={lab.status} />
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.03em]">{lab.name}</h1>
          <p className="text-steel-dim mt-1.5 text-sm">{lab.department}</p>
          <p className="text-steel mt-5 max-w-2xl text-lg">{lab.description}</p>

          <div className="mt-6">
            <HazardStrip label={lab.hazard} />
          </div>

          <div className="mt-6 flex flex-wrap gap-1.5">
            {lab.topics.map((topic) => (
              <MetaTag key={topic}>{topic}</MetaTag>
            ))}
          </div>
        </div>

        <LabEnvironment lab={lab} />
      </header>

      {bench ? (
        <section className="mt-16">
          <SectionHeading title="Standing bench" />
          <div className="mt-6">
            <SimMount sim={bench} />
          </div>
        </section>
      ) : null}

      {experiments.length ? (
        <section className="mt-16">
          <SectionHeading title="Experiments" />
          <ul className="mt-8 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {experiments.map((experiment) => (
              <li key={experiment.id} className="flex">
                <ExperimentCard experiment={experiment} />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="border-line mt-16 border-t pt-8">
          <h2 className="font-display text-amber text-xl font-semibold">No active experiments</h2>
          <p className="text-steel mt-2 max-w-md text-sm">
            The laboratory is quiet. The standing bench above still works.
          </p>
        </section>
      )}

      {cases.length ? (
        <section className="mt-16">
          <SectionHeading title="Case files" />
          <ul className="mt-8 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cases.map((item) => (
              <li key={item.id} className="flex">
                <CaseCard detectiveCase={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {dossiers.length ? (
        <section className="mt-16">
          <SectionHeading title="Dossiers" />
          <ul className="mt-8 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {dossiers.map((dossier) => (
              <li key={dossier.id} className="flex">
                <DossierCard dossier={dossier} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {myths.length ? (
        <section className="mt-16">
          <SectionHeading title="Myths filed against this lab" />
          <ul className="mt-8 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {myths.map((myth) => (
              <li key={myth.id} className="flex">
                <MythCard myth={myth} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
