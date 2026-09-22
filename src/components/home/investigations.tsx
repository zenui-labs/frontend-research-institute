import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CASES, MYTHS } from "@/content";
import { cn } from "@/lib/cn";
import { DifficultyBadge } from "@/components/ui/badges";

const VERDICT_STYLE: Record<string, string> = {
  BUSTED: "bg-peach text-rust",
  "IT DEPENDS": "bg-butter text-amber",
  "PARTLY TRUE": "bg-butter text-amber",
  OUTDATED: "bg-sage text-crt",
};

/**
 * Two reading modes side by side: one case worked in depth, and the myth
 * ledger scanned at a glance. Deliberately not another card grid.
 */
export function Investigations() {
  const [lead, ...otherCases] = CASES;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      {/* Evidence board */}
      <article className="relative">
        <div className="flex items-center justify-between gap-4 pb-1">
          <span className="label-tech">Frontend Detective</span>
          <span className="bg-peach text-2xs text-rust rounded-full px-2.5 py-1 font-medium tracking-[0.08em] uppercase">
            {lead.status}
          </span>
        </div>

        <div className="pt-7">
          <h3 className="font-display mt-2 text-3xl font-semibold text-balance">{lead.title}</h3>
          <p className="text-steel mt-4 max-w-lg text-base leading-relaxed">{lead.brief}</p>

          <ul className="mt-7">
            {lead.clues.slice(0, 4).map((clue) => (
              <li
                key={clue.id}
                className="bg-ink-850 mb-1.5 flex items-center gap-3 rounded-[14px] px-4 py-2.5"
              >
                <span className="text-steel text-sm">{clue.label}</span>
                <span className="text-2xs text-steel-dim ml-auto tracking-[0.08em] uppercase">
                  sealed
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link
              href={`/detective/${lead.slug}`}
              className="bg-crt text-ink-950 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[#7bf0b4]"
            >
              Work the case <ArrowRight size={14} aria-hidden />
            </Link>
            <DifficultyBadge difficulty={lead.difficulty} />
            <span className="text-steel-dim text-sm">
              {lead.clues.length} threads · {lead.suspects.length} suspects
            </span>
          </div>
        </div>

        <div className="mt-6">
          {otherCases.map((item) => (
            <Link
              key={item.id}
              href={`/detective/${item.slug}`}
              className="hover:bg-ink-850 hover:text-bone -mx-4 flex items-center justify-between gap-4 rounded-[14px] px-4 py-3.5 transition-colors"
            >
              <span className="text-bone min-w-0 truncate text-sm">{item.title}</span>
              <ArrowUpRight size={14} aria-hidden className="text-steel-dim shrink-0" />
            </Link>
          ))}
        </div>
      </article>

      {/* Myth ledger */}
      <section className="flex flex-col lg:pl-10">
        <div className="flex items-center justify-between gap-4 pb-1">
          <span className="label-tech">Myth ledger</span>
          <span className="text-2xs text-steel-dim">{MYTHS.length} claims on file</span>
        </div>

        <ol className="flex-1">
          {MYTHS.map((myth, i) => (
            <li key={myth.id}>
              <Link
                href={`/myths/${myth.slug}`}
                className="border-line hover:bg-ink-850 flex items-start gap-4 border-b py-4 transition-colors"
              >
                <span className="text-2xs text-steel-dim mt-0.5 font-mono tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-bone block text-base font-medium">“{myth.claim}”</span>
                  <span className="text-steel mt-1 line-clamp-1 text-sm">{myth.shortAnswer}</span>
                </span>
                <span
                  className={cn(
                    "text-2xs mt-0.5 shrink-0 rounded-full px-2.5 py-1 font-medium tracking-[0.08em] uppercase",
                    VERDICT_STYLE[myth.verdict] ?? "bg-sage text-crt",
                  )}
                >
                  {myth.verdict}
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <div className="pt-5">
          <Link
            href="/myths"
            className="text-crt inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-75"
          >
            Read the full archive <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
