import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ContentBlocks } from "@/components/content-blocks";
import { TrackDossierRead } from "@/components/progress/record-buttons";
import {
  DocumentHeader,
  DocumentNav,
  DocumentSection,
  RailField,
  RailFields,
  RailSection,
  ResearchLayout,
} from "@/components/research/research-layout";
import { TableOfContents, type TocItem } from "@/components/research/table-of-contents";
import { ReferenceList } from "@/components/ui/reference-list";
import { DOSSIERS, DOSSIER_BY_SLUG, getLab } from "@/content";
import { pad } from "@/lib/format";

export function generateStaticParams() {
  return DOSSIERS.map((dossier) => ({ slug: dossier.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/research/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const dossier = DOSSIER_BY_SLUG.get(slug);
  if (!dossier) return { title: "Dossier not found" };
  return {
    title: dossier.title,
    description: dossier.abstract,
    alternates: { canonical: `/research/${dossier.slug}` },
    openGraph: {
      title: dossier.title,
      description: dossier.abstract,
      type: "article",
      url: `/research/${dossier.slug}`,
    },
  };
}

function sectionId(heading: string) {
  return heading.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default async function DossierPage({ params }: PageProps<"/research/[slug]">) {
  const { slug } = await params;
  const dossier = DOSSIER_BY_SLUG.get(slug);
  if (!dossier) notFound();

  const lab = getLab(dossier.lab);
  const index = DOSSIERS.findIndex((item) => item.id === dossier.id);
  const previous = DOSSIERS[index - 1];
  const next = DOSSIERS[index + 1];

  const toc: TocItem[] = [
    ...dossier.sections.map((section) => ({
      id: sectionId(section.heading),
      label: section.heading,
    })),
    { id: "references", label: "References" },
  ];

  return (
    <>
      <TrackDossierRead id={dossier.id} />
      <ResearchLayout
        context={
          <div className="lg:sticky lg:top-28">
            <Link
              href="/research"
              className="text-2xs text-steel-dim hover:text-bone mb-7 inline-flex items-center gap-2 tracking-[0.12em] uppercase transition-colors"
            >
              <ArrowLeft size={12} aria-hidden /> Research library
            </Link>

            <RailFields>
              <RailField label="Field">{dossier.field}</RailField>
              <RailField label="Level">{dossier.difficulty}</RailField>
              <RailField label="Status">{dossier.status}</RailField>
              <RailField label="Laboratory">
                {lab ? (
                  <Link href={`/labs/${lab.slug}`} className="hover:text-crt transition-colors">
                    {lab.name}
                  </Link>
                ) : (
                  dossier.lab
                )}
              </RailField>
            </RailFields>

            <RailSection title="Record">
              <dl className="text-steel-dim space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt>Experiments</dt>
                  <dd className="text-bone font-mono">{pad(dossier.stats.experiments, 2)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Observations</dt>
                  <dd className="text-bone font-mono">{pad(dossier.stats.observations, 2)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>References</dt>
                  <dd className="text-bone font-mono">{pad(dossier.references.length, 2)}</dd>
                </div>
              </dl>
            </RailSection>
          </div>
        }
        toc={<TableOfContents items={toc} />}
      >
        <article>
          <DocumentHeader
            division={lab ? `${lab.name} · ${lab.code}` : dossier.field}
            subject={dossier.field}
            title={dossier.title}
            standfirst={dossier.abstract}
            meta={[
              { label: "Level", value: dossier.difficulty },
              { label: "Status", value: dossier.status },
              { label: "Experiments", value: pad(dossier.stats.experiments, 2) },
              { label: "Observations", value: pad(dossier.stats.observations, 2) },
            ]}
          />

          {dossier.sections.map((section) => (
            <DocumentSection
              key={section.heading}
              id={sectionId(section.heading)}
              title={section.heading}
            >
              <ContentBlocks blocks={section.blocks} />
            </DocumentSection>
          ))}

          <DocumentSection id="references" title="References">
            <ReferenceList items={dossier.references} />
          </DocumentSection>

          <DocumentNav
            previous={
              previous
                ? {
                    href: `/research/${previous.slug}`,
                    title: previous.title,
                  }
                : undefined
            }
            next={
              next
                ? {
                    href: `/research/${next.slug}`,
                    title: next.title,
                  }
                : undefined
            }
          />
        </article>
      </ResearchLayout>
    </>
  );
}
