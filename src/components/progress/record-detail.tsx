"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { CASES, DOSSIERS, EXPERIMENTS, MYTHS } from "@/content";
import { record, useHydrated, useProgress } from "@/lib/progress";
import { RetroButton } from "@/components/ui/retro-button";

export function RecordDetail() {
  const progress = useProgress();
  const hydrated = useHydrated();

  const sections = [
    {
      title: "Experiments completed",
      items: EXPERIMENTS.filter((e) => progress.completedExperiments.includes(e.id)).map((e) => ({
        id: e.id,
        label: e.title,
        href: `/experiments/${e.slug}` as const,
      })),
    },
    {
      title: "Cases closed",
      items: CASES.filter((c) => progress.solvedCases.includes(c.id)).map((c) => ({
        id: c.id,
        label: c.title,
        href: `/detective/${c.slug}` as const,
      })),
    },
    {
      title: "Dossiers read",
      items: DOSSIERS.filter((d) => progress.readDossiers.includes(d.id)).map((d) => ({
        id: d.id,
        label: d.title,
        href: `/research/${d.slug}` as const,
      })),
    },
    {
      title: "Myths investigated",
      items: MYTHS.filter((m) => progress.bustedMyths.includes(m.id)).map((m) => ({
        id: m.id,
        label: m.claim,
        href: `/myths/${m.slug}` as const,
      })),
    },
  ];

  const empty = hydrated && sections.every((s) => s.items.length === 0);

  return (
    <div className="space-y-8">
      {empty ? (
        <div className="dashed-edge bg-ink-850 px-6 py-10 text-center">
          <p className="text-amber font-mono text-xs tracking-[0.2em] uppercase">
            No completed research
          </p>
          <p className="text-steel-dim mx-auto mt-3 max-w-md text-sm leading-relaxed">
            Your record is empty and the laboratory is suspiciously quiet. Run an experiment and it
            will appear here, stored in this browser, visible to nobody else.
          </p>
          <Link
            href="/experiments"
            className="border-crt/40 bg-crt/10 text-2xs text-crt mt-6 inline-block border px-3 py-2 font-medium tracking-[0.08em] uppercase"
          >
            Start with an experiment
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {sections.map((section) => (
            <section
              key={section.title}
              className="border-line bg-ink-850 shadow-panel rounded-[12px] border p-5"
            >
              <p className="label-tech mb-3">
                {section.title} · {hydrated ? section.items.length : 0}
              </p>
              {section.items.length === 0 ? (
                <p className="text-steel-dim text-sm">Nothing logged yet.</p>
              ) : (
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="text-steel hover:text-crt text-sm transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <p className="text-steel-dim max-w-lg text-sm leading-relaxed">
          Everything above lives in this browser&apos;s localStorage. No account, no server, no
          analytics on your progress. Clearing it cannot be undone.
        </p>
        <RetroButton
          variant="danger"
          size="sm"
          onClick={() => {
            if (
              window.confirm(
                "Erase your research record and issue a new ID? This cannot be undone.",
              )
            ) {
              record.reset();
            }
          }}
        >
          <Trash2 size={12} aria-hidden /> Erase record
        </RetroButton>
      </div>
    </div>
  );
}
