import type { Metadata } from "next";
import Link from "next/link";
import { LABS } from "@/content";
import { cn } from "@/lib/cn";
import { SectionHeading } from "@/components/ui/panel";

export const metadata: Metadata = {
  title: "Laboratories",
  description:
    "Ten laboratories studying browser rendering, CSS layout, JavaScript runtime behaviour, React reconciliation, performance, networking, security, accessibility, architecture and algorithms.",
  alternates: { canonical: "/labs" },
};

const DOT: Record<string, string> = {
  OPERATIONAL: "bg-crt",
  CALIBRATING: "bg-amber",
  CLASSIFIED: "bg-steel-dim",
};

export default function LabsPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6">
      <SectionHeading title="Laboratories" />

      <div className="mt-12">
        <div className="flex items-center justify-between gap-4 px-4 pb-5">
          <span className="text-steel-dim font-mono text-xs">
            facility<span className="text-line-bright"> / </span>
            <span className="text-bone">map</span>
          </span>
          <span className="text-2xs text-steel-dim font-mono">
            {LABS.filter((l) => l.status === "OPERATIONAL").length} of {LABS.length} operational
          </span>
        </div>

        <ul>
          {LABS.map((lab) => {
            const locked = lab.status === "CLASSIFIED";
            const inner = (
              <>
                <span className="flex w-[104px] shrink-0 items-center gap-2.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", DOT[lab.status])} aria-hidden />
                  <span className="text-steel-dim font-mono text-xs">{lab.code}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "font-display block text-lg font-semibold transition-colors",
                      locked ? "text-steel" : "group-hover:text-crt",
                    )}
                  >
                    {lab.name}
                  </span>
                  <span className="text-steel-dim mt-0.5 block text-sm">{lab.tagline}</span>
                </span>
                <span className="hidden max-w-[260px] flex-wrap justify-end gap-1.5 lg:flex">
                  {lab.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="bg-ink-800 text-2xs text-steel-dim rounded-full px-2 py-0.5"
                    >
                      {topic}
                    </span>
                  ))}
                </span>
                <span className="text-2xs text-steel-dim w-[92px] shrink-0 text-right font-medium tracking-[0.08em] uppercase">
                  {lab.status}
                </span>
              </>
            );

            return (
              <li key={lab.slug}>
                {locked ? (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-4 opacity-55">
                    {inner}
                  </div>
                ) : (
                  <Link
                    href={`/labs/${lab.slug}`}
                    className="group border-line hover:bg-ink-850 flex flex-wrap items-center gap-x-5 gap-y-2 border-b px-5 py-4 transition-colors last:border-b-0"
                  >
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
