"use client";

import { useState, type ReactNode } from "react";
import { Check, Fingerprint, X } from "lucide-react";
import type { CaseClue, DetectiveCase } from "@/content/types";
import { cn } from "@/lib/cn";
import { play } from "@/lib/sound";
import { SolveCaseButton } from "@/components/progress/record-buttons";

export function Investigation({
  caseFile,
  children,
}: {
  caseFile: Pick<DetectiveCase, "id" | "clues" | "suspects">;
  children: ReactNode;
}) {
  const [pulled, setPulled] = useState<string[]>([]);
  const [accused, setAccused] = useState<string | null>(null);

  const culprits = caseFile.suspects.filter((s) => s.culprit).map((s) => s.id);
  const accusedSuspect = caseFile.suspects.find((s) => s.id === accused);
  const correct = accused !== null && culprits.includes(accused);
  const evidencePulled = caseFile.clues.filter(
    (c) => pulled.includes(c.id) && c.weight === "evidence",
  ).length;
  const totalEvidence = caseFile.clues.filter((c) => c.weight === "evidence").length;

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 flex flex-wrap items-center gap-3">
          <span className="border-line bg-peach text-2xs text-bone rounded-[12px] border px-1.5 py-0.5 font-medium tracking-[0.1em]">
            01
          </span>
          <span className="font-display text-xl font-semibold">Evidence board</span>
          <span className="text-2xs text-steel-dim ml-auto font-medium tracking-[0.08em] uppercase">
            {evidencePulled} / {totalEvidence} material findings
          </span>
        </h2>

        <ul className="grid gap-3 sm:grid-cols-2">
          {caseFile.clues.map((clue) => (
            <ClueCard
              key={clue.id}
              clue={clue}
              open={pulled.includes(clue.id)}
              onOpen={() => {
                if (pulled.includes(clue.id)) return;
                setPulled((p) => [...p, clue.id]);
                play(clue.weight === "evidence" ? "beep" : "click");
              }}
            />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-3">
          <span className="border-line bg-peach text-2xs text-bone rounded-[12px] border px-1.5 py-0.5 font-medium tracking-[0.1em]">
            02
          </span>
          <span className="font-display text-xl font-semibold">Name a suspect</span>
        </h2>

        <ul className="grid gap-2">
          {caseFile.suspects.map((suspect) => {
            const chosen = accused === suspect.id;
            const revealed = accused !== null;
            return (
              <li key={suspect.id}>
                <button
                  type="button"
                  onClick={() => {
                    setAccused(suspect.id);
                    play(suspect.culprit ? "complete" : "error");
                  }}
                  aria-pressed={chosen}
                  className={cn(
                    "w-full rounded-[12px] border px-4 py-3 text-left transition-[transform,box-shadow,background-color]",
                    revealed && suspect.culprit
                      ? "border-line bg-sage shadow-panel"
                      : chosen
                        ? "border-line bg-peach shadow-panel"
                        : "border-line bg-ink-850",
                  )}
                >
                  <span className="flex items-center gap-3">
                    {revealed ? (
                      suspect.culprit ? (
                        <Check size={14} aria-hidden className="text-crt shrink-0" />
                      ) : (
                        <X size={14} aria-hidden className="text-steel-dim shrink-0" />
                      )
                    ) : (
                      <Fingerprint size={14} aria-hidden className="text-steel-dim shrink-0" />
                    )}
                    <span className="text-bone text-base">{suspect.label}</span>
                  </span>
                  {revealed ? (
                    <span className="text-steel-dim mt-2 block pl-7 text-sm leading-relaxed">
                      {suspect.verdict}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>

        {accused ? (
          <p
            className={cn(
              "text-2xs mt-4 rounded-[12px] border px-4 py-3 font-medium tracking-[0.1em] uppercase",
              correct ? "border-line bg-sage text-bone" : "border-line bg-butter text-bone",
            )}
          >
            {correct
              ? "Correct. The institute notes this in your record."
              : `Not the cause. ${accusedSuspect?.label ?? "That suspect"} is exonerated, read the resolution.`}
          </p>
        ) : null}
      </section>

      {accused ? (
        <section>
          <h2 className="mb-4 flex items-center gap-3">
            <span className="border-line bg-peach text-2xs text-bone rounded-[12px] border px-1.5 py-0.5 font-medium tracking-[0.1em]">
              03
            </span>
            <span className="font-display text-xl font-semibold">Resolution</span>
          </h2>
          {children}
          <div className="mt-6">
            <SolveCaseButton id={caseFile.id} />
          </div>
        </section>
      ) : (
        <p className="dashed-edge bg-ink-850 text-2xs text-steel-dim px-4 py-6 text-center font-medium tracking-[0.08em] uppercase">
          Resolution sealed until a suspect is named
        </p>
      )}
    </div>
  );
}

function ClueCard({ clue, open, onOpen }: { clue: CaseClue; open: boolean; onOpen: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        aria-expanded={open}
        className={cn(
          "border-line flex h-full w-full flex-col rounded-[12px] border px-4 py-3 text-left transition-[transform,box-shadow,background-color]",
          open
            ? clue.weight === "evidence"
              ? "bg-sage shadow-panel"
              : "bg-ink-700"
            : "bg-ink-850",
        )}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="text-bone font-mono text-xs">{clue.label}</span>
          <span className="text-2xs text-steel-dim shrink-0 font-medium tracking-[0.08em] uppercase">
            {open ? (clue.weight === "evidence" ? "material" : "no bearing") : "pull thread"}
          </span>
        </span>
        {open ? (
          <span className="text-steel mt-2 text-sm leading-relaxed">{clue.finding}</span>
        ) : null}
      </button>
    </li>
  );
}
