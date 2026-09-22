import type { Metadata } from "next";
import { BadgeGrid } from "@/components/progress/badge-grid";
import { RecordDetail } from "@/components/progress/record-detail";
import { ResearchIdCard } from "@/components/progress/research-id";
import { SectionHeading } from "@/components/ui/panel";
import { RANKS } from "@/lib/ranks";

export const metadata: Metadata = {
  title: "Research ID",
  description:
    "Your local research record: experiments completed, cases closed, dossiers read, badges awarded. Stored in your browser, never uploaded.",
  robots: { index: false, follow: true },
};

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6">
      <SectionHeading title="Research ID" />

      <div className="mt-10">
        <ResearchIdCard />
      </div>

      <section className="mt-12">
        <h2 className="font-display mb-5 text-xl font-semibold">Record</h2>
        <RecordDetail />
      </section>

      <section className="mt-14">
        <BadgeGrid />
      </section>

      <section className="mt-14">
        <h2 className="font-display mb-5 text-xl font-semibold">Grades</h2>
        <ol className="grid gap-2">
          {RANKS.map((rank) => (
            <li
              key={rank.title}
              className="border-line bg-ink-850 shadow-panel flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-[12px] border px-4 py-2.5"
            >
              <span className="text-2xs text-crt w-12 font-mono tabular-nums">
                {String(rank.min).padStart(2, "0")}
              </span>
              <span className="font-display text-base font-semibold">{rank.title}</span>
              <span className="text-steel-dim text-sm">{rank.blurb}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
