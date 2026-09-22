"use client";

import { useMemo, useState } from "react";
import { CornerDownRight, RotateCcw } from "lucide-react";
import type { WhyNode } from "@/content/types";
import { record } from "@/lib/progress";
import { play } from "@/lib/sound";
import { RichText } from "@/components/ui/rich-text";
import { RetroButton } from "@/components/ui/retro-button";

function flatten(node: WhyNode): string[] {
  const out: string[] = [];
  let cursor: WhyNode | undefined = node;
  while (cursor) {
    out.push(cursor.answer);
    cursor = cursor.next;
  }
  return out;
}

export function WhyMachine({ question, chain }: { question: string; chain: WhyNode }) {
  const answers = useMemo(() => flatten(chain), [chain]);
  const [depth, setDepth] = useState(1);
  const exhausted = depth >= answers.length;

  return (
    <section className="panel overflow-hidden" aria-label={`Why machine: ${question}`}>
      <div className="border-line flex items-center justify-between border-b px-4 py-3">
        <span className="font-display text-base font-semibold">The Why Machine</span>
        <span className="label-tech tabular-nums">
          DEPTH {depth} / {answers.length}
        </span>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <p className="text-bone mb-4 text-base leading-relaxed font-medium">
          <RichText text={question} />
        </p>

        <ol className="space-y-3">
          {answers.slice(0, depth).map((answer, i) => (
            <li
              key={i}
              className="border-sage flex gap-3 border-l-2 pl-4"
              style={{ marginLeft: `${Math.min(i, 4) * 10}px` }}
            >
              <CornerDownRight size={14} aria-hidden className="text-steel-dim mt-1 shrink-0" />
              <p className="text-steel text-sm leading-relaxed">
                <RichText text={answer} />
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {exhausted ? (
            <>
              <pre className="bg-sage text-crt flex-1 rounded-[12px] px-3.5 py-2.5 font-mono text-xs leading-relaxed">
                {`YOU HAVE REACHED THE CURRENT
DEPTH OF THE RABBIT HOLE.`}
              </pre>
              <RetroButton size="sm" onClick={() => setDepth(1)} aria-label="Return to surface">
                <RotateCcw size={12} aria-hidden /> Return to surface
              </RetroButton>
            </>
          ) : (
            <RetroButton
              variant="primary"
              size="sm"
              onClick={() => {
                const next = depth + 1;
                setDepth(next);
                record.noteWhyDepth(next);
                if (next >= answers.length) {
                  record.discover(`why:${question.slice(0, 40)}`);
                  play("complete");
                }
              }}
            >
              Why?
            </RetroButton>
          )}
        </div>
      </div>
    </section>
  );
}
