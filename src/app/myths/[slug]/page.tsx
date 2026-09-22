import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ContentBlocks } from "@/components/content-blocks";
import { BustMythButton } from "@/components/progress/record-buttons";
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
import { MYTHS, MYTH_BY_SLUG, getLab } from "@/content";
import { cn } from "@/lib/cn";
import { pad } from "@/lib/format";

export function generateStaticParams() {
  return MYTHS.map((myth) => ({ slug: myth.slug }));
}

export async function generateMetadata({ params }: PageProps<"/myths/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const myth = MYTH_BY_SLUG.get(slug);
  if (!myth) return { title: "Myth not found" };
  return {
    title: `“${myth.claim}”`,
    description: myth.shortAnswer,
    alternates: { canonical: `/myths/${myth.slug}` },
    openGraph: {
      title: `“${myth.claim}”, ${myth.verdict}`,
      description: myth.shortAnswer,
      type: "article",
      url: `/myths/${myth.slug}`,
    },
  };
}

export default async function MythPage({ params }: PageProps<"/myths/[slug]">) {
  const { slug } = await params;
  const myth = MYTH_BY_SLUG.get(slug);
  if (!myth) notFound();

  const lab = getLab(myth.lab);
  const index = MYTHS.findIndex((item) => item.id === myth.id);
  const previous = MYTHS[index - 1];
  const next = MYTHS[index + 1];

  return (
    <ResearchLayout
      context={
        <div className="lg:sticky lg:top-28">
          <Link
            href="/myths"
            className="text-2xs text-steel-dim hover:text-bone mb-7 inline-flex items-center gap-2 tracking-[0.12em] uppercase transition-colors"
          >
            <ArrowLeft size={12} aria-hidden /> Myth archive
          </Link>
          <RailFields>
            <RailField label="Verdict">
              <span
                className={cn(
                  myth.verdict === "BUSTED"
                    ? "text-rust"
                    : myth.verdict === "IT DEPENDS"
                      ? "text-amber"
                      : "text-crt",
                )}
              >
                {myth.verdict}
              </span>
            </RailField>
            <RailField label="Level">{myth.difficulty}</RailField>
            <RailField label="Laboratory">
              {lab ? (
                <Link href={`/labs/${lab.slug}`} className="hover:text-crt transition-colors">
                  {lab.name}
                </Link>
              ) : (
                myth.lab
              )}
            </RailField>
          </RailFields>

          <RailSection title="Record">
            <BustMythButton id={myth.id} />
          </RailSection>
        </div>
      }
    >
      <article>
        <DocumentHeader
          division={lab ? `${lab.name} · ${lab.code}` : "Myth archive"}
          subject="Under investigation"
          title={`“${myth.claim}”`}
          standfirst={myth.shortAnswer}
          meta={[
            { label: "Verdict", value: myth.verdict },
            { label: "Level", value: myth.difficulty },
            { label: "Division", value: lab?.code ?? "" },
            { label: "References", value: pad(myth.references.length, 2) },
          ]}
        />

        <DocumentSection id="investigation" title="Investigation">
          <ContentBlocks blocks={myth.body} />
        </DocumentSection>

        <DocumentSection id="references" title="References">
          <ReferenceList items={myth.references} />
        </DocumentSection>

        <DocumentNav
          previous={
            previous
              ? {
                  href: `/myths/${previous.slug}`,
                  title: previous.claim,
                }
              : undefined
          }
          next={next ? { href: `/myths/${next.slug}`, title: next.claim } : undefined}
        />
      </article>
    </ResearchLayout>
  );
}
