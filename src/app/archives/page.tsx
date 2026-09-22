import type { Metadata } from "next";
import { ArtifactCard } from "@/components/ui/cards";
import { SectionHeading } from "@/components/ui/panel";
import { ARTIFACTS, ARCHIVE_ERAS } from "@/content/archive";

export const metadata: Metadata = {
  title: "Web Archaeology",
  description:
    "The browser museum: table layouts, spacer.gif, framesets, Flash, IE6, jQuery, XMLHttpRequest, responsive design, the SPA era and application cache, what each one taught the web.",
  alternates: { canonical: "/archives" },
};

export default function ArchivesPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6">
      <SectionHeading title="The browser museum" />

      <div className="mt-10 space-y-16">
        {ARCHIVE_ERAS.map((era) => {
          const items = ARTIFACTS.filter((a) => a.era === era).sort((a, b) => a.year - b.year);
          if (!items.length) return null;
          return (
            <section key={era}>
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-display text-xl font-semibold">{era}</h2>
                <span className="text-2xs text-steel-dim font-medium tracking-[0.08em]">
                  {items[0].year}, {items[items.length - 1].year}
                </span>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((artifact) => (
                  <li key={artifact.id} className="flex">
                    <ArtifactCard artifact={artifact} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <aside className="dashed-edge bg-ink-850 mt-16 px-6 py-6">
        <p className="label-tech mb-3">Curator&apos;s note</p>
        <p className="text-steel max-w-3xl text-base leading-relaxed">
          Nothing in this collection was stupid. Table layout existed because CSS could not position
          reliably; the spacer GIF existed because there was no margin you could trust; framesets
          existed because there was no other way to keep a navigation bar on screen. Today&apos;s
          techniques will be exhibits too. The useful question is not what was wrong with them, but
          what constraint made them reasonable.
        </p>
      </aside>
    </div>
  );
}
