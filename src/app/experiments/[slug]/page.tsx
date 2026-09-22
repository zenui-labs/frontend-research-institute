import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ContentBlocks } from "@/components/content-blocks";
import { CompleteExperimentButton } from "@/components/progress/record-buttons";
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
import { RichText } from "@/components/ui/rich-text";
import { EXPERIMENTS, EXPERIMENT_BY_SLUG, getLab, relatedExperiments } from "@/content";
import type { ContentBlock } from "@/content/types";
import { pad } from "@/lib/format";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return EXPERIMENTS.map((experiment) => ({ slug: experiment.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/experiments/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const experiment = EXPERIMENT_BY_SLUG.get(slug);
  if (!experiment) return { title: "Experiment not found" };
  return {
    title: experiment.title,
    description: experiment.summary,
    alternates: { canonical: `/experiments/${experiment.slug}` },
    openGraph: {
      title: experiment.title,
      description: experiment.summary,
      type: "article",
      url: `/experiments/${experiment.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: experiment.title,
      description: experiment.summary,
    },
  };
}

/** Interactive benches belong to the laboratory, not to the reading column. */
function readingBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.filter((block) => block.type !== "sim");
}

function hasSim(blocks: ContentBlock[]): boolean {
  return blocks.some((block) => block.type === "sim");
}

export default async function ExperimentPage({ params }: PageProps<"/experiments/[slug]">) {
  const { slug } = await params;
  const experiment = EXPERIMENT_BY_SLUG.get(slug);
  if (!experiment) notFound();

  const lab = getLab(experiment.lab);
  const related = relatedExperiments(experiment);
  const index = EXPERIMENTS.findIndex((item) => item.id === experiment.id);
  const previous = EXPERIMENTS[index - 1];
  const next = EXPERIMENTS[index + 1];
  const interactive =
    hasSim(experiment.sections.experiment) ||
    hasSim(experiment.sections.observation) ||
    hasSim(experiment.sections.explanation);

  const sections: { id: string; title: string }[] = [
    { id: "question", title: "The question" },
    ...(experiment.hypothesis ? [{ id: "hypothesis", title: "Hypothesis" }] : []),
    { id: "method", title: "Method" },
    { id: "observation", title: "What we observed" },
    { id: "explanation", title: "Why it happens" },
    ...(experiment.sections.deeper?.length ? [{ id: "further", title: "Further research" }] : []),
    { id: "references", title: "References" },
  ];

  const toc: TocItem[] = sections.map((section) => ({ id: section.id, label: section.title }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LearningResource",
            name: experiment.title,
            headline: experiment.title,
            description: experiment.summary,
            educationalLevel: experiment.difficulty,
            learningResourceType: "Interactive experiment",
            timeRequired: `PT${experiment.estimatedMinutes}M`,
            about: experiment.concepts,
            inLanguage: "en",
            isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
            citation: experiment.references.map((reference) => reference.url),
          }),
        }}
      />

      <ResearchLayout
        context={
          <div className="lg:sticky lg:top-28">
            <Link
              href="/experiments"
              className="text-2xs text-steel-dim hover:text-bone mb-7 inline-flex items-center gap-2 tracking-[0.12em] uppercase transition-colors"
            >
              <ArrowLeft size={12} aria-hidden /> All research
            </Link>

            <RailFields>
              <RailField label="Research lab">
                {lab ? (
                  <Link href={`/labs/${lab.slug}`} className="hover:text-crt transition-colors">
                    {lab.name}
                  </Link>
                ) : (
                  experiment.lab
                )}
              </RailField>
              <RailField label="Level">{experiment.difficulty}</RailField>
              <RailField label="Read time">{experiment.estimatedMinutes} min</RailField>
              <RailField label="Experiment">{interactive ? "Available" : "Reading only"}</RailField>
            </RailFields>

            {interactive ? (
              <Link
                href={`/experiments/${experiment.slug}/lab`}
                className="border-crt/45 text-crt hover:bg-crt/10 mt-6 inline-flex w-full items-center justify-between gap-2 rounded-[12px] border px-3.5 py-2.5 text-sm transition-colors"
              >
                Run experiment <ArrowRight size={14} aria-hidden />
              </Link>
            ) : null}

            {related.length ? (
              <RailSection title="Related">
                <ul className="space-y-3">
                  {related.map((item) => (
                    <li key={item.id}>
                      <Link href={`/experiments/${item.slug}`} className="group block">
                        <span className="text-2xs text-steel-dim font-mono">
                          #{pad(item.number, 3)}
                        </span>
                        <span className="text-steel group-hover:text-bone mt-0.5 block text-sm transition-colors">
                          {item.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </RailSection>
            ) : null}
          </div>
        }
        toc={<TableOfContents items={toc} />}
      >
        <article>
          <DocumentHeader
            division={lab ? `${lab.name} · ${lab.code}` : "Research division"}
            subject={experiment.concepts.slice(0, 2).join(" / ")}
            title={experiment.title}
            standfirst={experiment.summary}
            meta={[
              { label: "Level", value: experiment.difficulty },
              { label: "Read time", value: `${pad(experiment.estimatedMinutes, 2)} min` },
              { label: "Experiment", value: interactive ? "Available" : "" },
              { label: "Type", value: experiment.type },
            ]}
          />

          <DocumentSection id="question" title="The question">
            <p className="text-bone text-xl leading-relaxed">
              <RichText text={experiment.question} />
            </p>
          </DocumentSection>

          {experiment.hypothesis ? (
            <DocumentSection id="hypothesis" title="Hypothesis">
              <p className="border-crt/50 text-steel border-l-2 pl-5 text-[1.0625rem] leading-relaxed">
                <RichText text={experiment.hypothesis} />
              </p>
            </DocumentSection>
          ) : null}

          <DocumentSection id="method" title="Method">
            {interactive ? (
              <div className="border-line mb-7 border px-5 py-4">
                <p className="text-2xs text-crt font-medium tracking-[0.14em] uppercase">
                  Laboratory available
                </p>
                <p className="text-steel mt-2 text-sm leading-relaxed">
                  The instrument for this investigation runs in the laboratory, where the controls,
                  the live model and the observation log share one workstation.
                </p>
                <Link
                  href={`/experiments/${experiment.slug}/lab`}
                  className="bg-crt text-ink-950 mt-4 inline-flex items-center gap-2 rounded-[12px] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#7bf0b4]"
                >
                  Enter the laboratory <ArrowRight size={14} aria-hidden />
                </Link>
              </div>
            ) : null}
            <ContentBlocks blocks={readingBlocks(experiment.sections.experiment)} />
          </DocumentSection>

          <DocumentSection id="observation" title="What we observed">
            <ContentBlocks blocks={readingBlocks(experiment.sections.observation)} />
          </DocumentSection>

          <DocumentSection id="explanation" title="Why it happens">
            <ContentBlocks blocks={readingBlocks(experiment.sections.explanation)} />
          </DocumentSection>

          {experiment.sections.deeper?.length ? (
            <DocumentSection id="further" title="Further research">
              <ContentBlocks blocks={readingBlocks(experiment.sections.deeper)} />
            </DocumentSection>
          ) : null}

          <DocumentSection id="references" title="References">
            <ReferenceList items={experiment.references} />
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <CompleteExperimentButton id={experiment.id} />
            </div>
          </DocumentSection>

          <DocumentNav
            previous={
              previous
                ? {
                    href: `/experiments/${previous.slug}`,
                    title: previous.title,
                  }
                : undefined
            }
            next={
              next
                ? {
                    href: `/experiments/${next.slug}`,
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
