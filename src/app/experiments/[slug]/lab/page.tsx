import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabShell } from "@/components/experiments/lab-shell";
import { EXPERIMENTS, EXPERIMENT_BY_SLUG, getLab } from "@/content";
import type { ContentBlock, SimKey } from "@/content/types";

export function generateStaticParams() {
  return EXPERIMENTS.map((experiment) => ({ slug: experiment.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/experiments/[slug]/lab">): Promise<Metadata> {
  const { slug } = await params;
  const experiment = EXPERIMENT_BY_SLUG.get(slug);
  if (!experiment) return { title: "Experiment not found" };
  return {
    title: `${experiment.title}, laboratory`,
    description: experiment.summary,
    alternates: { canonical: `/experiments/${experiment.slug}/lab` },
    robots: { index: false, follow: true },
  };
}

function collectSims(blocks: ContentBlock[]): SimKey[] {
  return blocks.flatMap((block) => (block.type === "sim" ? [block.sim] : []));
}

export default async function LabPage({ params }: PageProps<"/experiments/[slug]/lab">) {
  const { slug } = await params;
  const experiment = EXPERIMENT_BY_SLUG.get(slug);
  if (!experiment) notFound();

  const sims = [
    ...collectSims(experiment.sections.experiment),
    ...collectSims(experiment.sections.observation),
    ...collectSims(experiment.sections.explanation),
  ];

  return (
    <LabShell experiment={experiment} lab={getLab(experiment.lab)} sims={[...new Set(sims)]} />
  );
}
