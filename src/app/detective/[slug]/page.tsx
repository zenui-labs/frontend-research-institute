import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ContentBlocks } from "@/components/content-blocks";
import { Investigation } from "@/components/detective/investigation";
import {
  DocumentHeader,
  DocumentNav,
  DocumentSection,
  RailField,
  RailFields,
  RailSection,
  ResearchLayout,
} from "@/components/research/research-layout";
import { ReferenceList } from "@/components/ui/reference-list";
import { CASES, CASE_BY_SLUG, getLab } from "@/content";
import { pad } from "@/lib/format";

export function generateStaticParams() {
  return CASES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/detective/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = CASE_BY_SLUG.get(slug);
  if (!item) return { title: "Case not found" };
  return {
    title: item.title,
    description: item.brief,
    alternates: { canonical: `/detective/${item.slug}` },
    openGraph: {
      title: item.title,
      description: item.brief,
      type: "article",
      url: `/detective/${item.slug}`,
    },
  };
}

export default async function CasePage({ params }: PageProps<"/detective/[slug]">) {
  const { slug } = await params;
  const item = CASE_BY_SLUG.get(slug);
  if (!item) notFound();

  const lab = getLab(item.lab);
  const index = CASES.findIndex((entry) => entry.id === item.id);
  const previous = CASES[index - 1];
  const next = CASES[index + 1];

  return (
    <ResearchLayout
      context={
        <div className="lg:sticky lg:top-28">
          <Link
            href="/detective"
            className="text-2xs text-steel-dim hover:text-bone mb-7 inline-flex items-center gap-2 tracking-[0.12em] uppercase transition-colors"
          >
            <ArrowLeft size={12} aria-hidden /> Case files
          </Link>
          <RailFields>
            <RailField label="Status">{item.status}</RailField>
            <RailField label="Level">{item.difficulty}</RailField>
            <RailField label="Laboratory">
              {lab ? (
                <Link href={`/labs/${lab.slug}`} className="hover:text-crt transition-colors">
                  {lab.name}
                </Link>
              ) : (
                item.lab
              )}
            </RailField>
          </RailFields>

          <RailSection title="Case material">
            <dl className="text-steel-dim space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt>Threads</dt>
                <dd className="text-bone font-mono">{pad(item.clues.length, 2)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Suspects</dt>
                <dd className="text-bone font-mono">{pad(item.suspects.length, 2)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>References</dt>
                <dd className="text-bone font-mono">{pad(item.references.length, 2)}</dd>
              </div>
            </dl>
          </RailSection>
        </div>
      }
    >
      <article>
        <DocumentHeader
          division={lab ? `${lab.name} · ${lab.code}` : "Investigations division"}
          subject={item.status}
          title={item.title}
          standfirst={item.brief}
          meta={[
            { label: "Status", value: item.status },
            { label: "Level", value: item.difficulty },
            { label: "Threads", value: pad(item.clues.length, 2) },
            { label: "Suspects", value: pad(item.suspects.length, 2) },
          ]}
        />

        <DocumentSection id="scene" title="The scene">
          <ContentBlocks blocks={item.scene} />
        </DocumentSection>

        <div className="mt-14">
          <Investigation caseFile={item}>
            <ContentBlocks blocks={item.resolution} />
          </Investigation>
        </div>

        <DocumentSection id="references" title="References">
          <ReferenceList items={item.references} />
        </DocumentSection>

        <DocumentNav
          previous={
            previous
              ? {
                  href: `/detective/${previous.slug}`,
                  title: previous.title,
                }
              : undefined
          }
          next={
            next
              ? {
                  href: `/detective/${next.slug}`,
                  title: next.title,
                }
              : undefined
          }
        />
      </article>
    </ResearchLayout>
  );
}
