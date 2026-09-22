import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type {
  Artifact,
  DetectiveCase,
  Dossier,
  Experiment,
  Laboratory,
  Myth,
} from "@/content/types";
import { cn } from "@/lib/cn";
import { DifficultyBadge, MetaTag, StatusChip } from "./badges";

const CARD = "card-quiet group flex flex-col p-5 hover:border-line-bright hover:bg-ink-800";

const ACCENT_DOT: Record<Laboratory["accent"], string> = {
  crt: "bg-crt",
  amber: "bg-amber",
  rust: "bg-rust",
  signal: "bg-signal",
  steel: "bg-steel-dim",
};

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display group-hover:text-crt text-xl leading-snug font-semibold text-balance transition-colors">
      {children}
    </h3>
  );
}

export function ExperimentCard({ experiment }: { experiment: Experiment }) {
  return (
    <Link href={`/experiments/${experiment.slug}`} className={CARD}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="label-tech">{experiment.lab}</span>
        <DifficultyBadge difficulty={experiment.difficulty} />
      </div>

      <CardTitle>{experiment.title}</CardTitle>
      <p className="text-steel mt-2 line-clamp-3 flex-1 text-sm leading-relaxed">
        {experiment.summary}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        <MetaTag>{experiment.lab}</MetaTag>
        <MetaTag>{experiment.estimatedMinutes} min</MetaTag>
        <ArrowUpRight
          size={15}
          aria-hidden
          className="text-steel-dim group-hover:text-crt ml-auto transition-[transform,color]"
        />
      </div>
    </Link>
  );
}

export function DossierCard({ dossier }: { dossier: Dossier }) {
  return (
    <Link href={`/research/${dossier.slug}`} className={CARD}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="label-tech">{dossier.field}</span>
        <StatusChip status={dossier.status} />
      </div>

      <CardTitle>{dossier.title}</CardTitle>
      <p className="text-steel mt-2 line-clamp-3 flex-1 text-sm leading-relaxed">
        {dossier.abstract}
      </p>

      <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
        {[
          ["Field", dossier.field],
          ["Experiments", String(dossier.stats.experiments)],
          ["Observations", String(dossier.stats.observations)],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="label-tech">{label}</dt>
            <dd className="text-bone mt-1 font-mono text-xs">{value}</dd>
          </div>
        ))}
      </dl>
    </Link>
  );
}

export function CaseCard({ detectiveCase }: { detectiveCase: DetectiveCase }) {
  return (
    <Link href={`/detective/${detectiveCase.slug}`} className={CARD}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="label-tech">Case file</span>
        <StatusChip status={detectiveCase.status} />
      </div>

      <CardTitle>{detectiveCase.title}</CardTitle>
      <p className="text-steel mt-2 line-clamp-3 flex-1 text-sm leading-relaxed">
        {detectiveCase.brief}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        <DifficultyBadge difficulty={detectiveCase.difficulty} />
        <MetaTag>{detectiveCase.clues.length} clues</MetaTag>
        <MetaTag>{detectiveCase.suspects.length} suspects</MetaTag>
      </div>
    </Link>
  );
}

export function MythCard({ myth }: { myth: Myth }) {
  return (
    <Link href={`/myths/${myth.slug}`} className={CARD}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="label-tech">Claim</span>
        <span
          className={cn(
            "text-2xs rounded-full px-2 py-0.5 font-medium tracking-[0.1em] uppercase",
            myth.verdict === "BUSTED"
              ? "bg-peach text-rust"
              : myth.verdict === "IT DEPENDS"
                ? "bg-butter text-amber"
                : "bg-sage text-crt",
          )}
        >
          {myth.verdict}
        </span>
      </div>

      <CardTitle>“{myth.claim}”</CardTitle>
      <p className="text-steel mt-2 line-clamp-3 flex-1 text-sm leading-relaxed">
        {myth.shortAnswer}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        <DifficultyBadge difficulty={myth.difficulty} />
        <MetaTag>{myth.lab}</MetaTag>
      </div>
    </Link>
  );
}

export function LabCard({ lab, featured = false }: { lab: Laboratory; featured?: boolean }) {
  const locked = lab.status === "CLASSIFIED";

  const body = (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="label-tech flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 rounded-full", ACCENT_DOT[lab.accent])} aria-hidden />
          {lab.code}
        </span>
        <StatusChip status={lab.status} />
      </div>

      <h3
        className={cn(
          "font-display font-semibold transition-colors",
          featured ? "text-2xl" : "text-xl",
          !locked && "group-hover:text-crt",
        )}
      >
        {lab.name}
      </h3>
      <p className="text-steel-dim mt-1 text-xs">{lab.department}</p>
      <p
        className={cn("text-steel mt-3 flex-1 leading-relaxed", featured ? "text-base" : "text-sm")}
      >
        {featured ? lab.description : lab.tagline}
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {lab.topics.slice(0, featured ? 5 : 3).map((topic) => (
          <MetaTag key={topic}>{topic}</MetaTag>
        ))}
      </div>
    </>
  );

  if (locked) {
    return (
      <div
        className="card-quiet flex w-full flex-col p-5 opacity-70"
        aria-label={`${lab.name}, classified`}
      >
        {body}
      </div>
    );
  }

  return (
    <Link href={`/labs/${lab.slug}`} className={cn(CARD, "w-full", featured && "p-6")}>
      {body}
    </Link>
  );
}

/** Compact row for laboratories that are not open yet. */
export function LabRow({ lab }: { lab: Laboratory }) {
  const locked = lab.status === "CLASSIFIED";
  const inner = (
    <>
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", ACCENT_DOT[lab.accent])}
          aria-hidden
        />
        <span className="label-tech w-14 shrink-0">{lab.code}</span>
        <span
          className={cn("font-display shrink-0 text-base font-semibold", locked && "text-steel")}
        >
          {lab.name}
        </span>
        <span className="text-steel-dim hidden truncate text-sm sm:block">{lab.tagline}</span>
      </span>
      <StatusChip status={lab.status} className="shrink-0" />
    </>
  );

  if (locked) {
    return (
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 opacity-65">{inner}</div>
    );
  }

  return (
    <Link
      href={`/labs/${lab.slug}`}
      className="hover:bg-ink-800 flex items-center justify-between gap-4 px-5 py-3.5 transition-colors"
    >
      {inner}
    </Link>
  );
}

export function ArtifactCard({ artifact }: { artifact: Artifact }) {
  return (
    <article id={artifact.slug} className="card-quiet flex scroll-mt-24 flex-col p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="label-tech">{artifact.year}</span>
        <span
          className={cn(
            "text-2xs rounded-full px-2 py-0.5 font-medium tracking-[0.1em] uppercase",
            artifact.status === "EXTINCT"
              ? "bg-peach text-rust"
              : artifact.status === "STILL BREATHING"
                ? "bg-sage text-crt"
                : "bg-butter text-amber",
          )}
        >
          {artifact.status}
        </span>
      </div>

      <h3 className="font-display text-xl font-semibold">{artifact.name}</h3>
      <p className="text-steel mt-2 flex-1 text-sm leading-relaxed">{artifact.summary}</p>
      <p className="bg-ink-700 text-paper-dim mt-4 rounded-[12px] px-3.5 py-2.5 text-sm leading-relaxed italic">
        {artifact.epitaph}
      </p>
      <p className="text-steel mt-3 text-sm leading-relaxed">{artifact.legacy}</p>
    </article>
  );
}
