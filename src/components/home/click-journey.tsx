"use client";

import { useEffect, useRef, useState } from "react";
import { MousePointerClick, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/reduced-motion";
import { play } from "@/lib/sound";
import { RetroButton } from "@/components/ui/retro-button";

const STAGES = [
  {
    id: "input",
    label: "CLICK",
    detail: "The OS delivers a pointer event to the browser process.",
  },
  {
    id: "event",
    label: "EVENT",
    detail: "A task is queued on the renderer's event loop. Input has priority.",
  },
  {
    id: "capture",
    label: "CAPTURE",
    detail: "The event travels down from window to the target's parent.",
  },
  {
    id: "target",
    label: "TARGET",
    detail: "Listeners on the element itself fire, capture phase first.",
  },
  {
    id: "bubble",
    label: "BUBBLE",
    detail: "The event travels back up. Delegated handlers run here.",
  },
  {
    id: "handler",
    label: "HANDLER",
    detail: "Your function runs, on the main thread, blocking everything else.",
  },
  {
    id: "state",
    label: "STATE UPDATE",
    detail: "React schedules work. Updates in the same event are batched.",
  },
  {
    id: "render",
    label: "RENDER",
    detail: "Render, reconcile, commit, then style, layout, paint, composite.",
  },
] as const;

export function ClickJourney() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(-1);
  const [runs, setRuns] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(window.clearTimeout);
  }, []);

  function start() {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    play("click");
    if (reduced) {
      setActive(STAGES.length - 1);
      setRuns((r) => r + 1);
      return;
    }
    setActive(0);
    STAGES.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setActive(i);
          if (i === STAGES.length - 1) {
            play("complete");
            setRuns((r) => r + 1);
          }
        }, i * 460),
      );
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-display text-2xl font-semibold">
          What happens when you click a button?
        </h3>
        <span className="label-tech">{runs} runs</span>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
        <div className="flex flex-col items-center justify-center gap-4">
          <RetroButton variant="primary" onClick={start}>
            <MousePointerClick size={13} aria-hidden />
            Press the button
          </RetroButton>
          {active >= 0 ? (
            <RetroButton size="sm" onClick={() => setActive(-1)}>
              <RotateCcw size={11} aria-hidden /> Reset
            </RetroButton>
          ) : null}
        </div>

        <ol className="space-y-1.5">
          {STAGES.map((stage, i) => {
            const reached = active >= i;
            const current = active === i;
            return (
              <li
                key={stage.id}
                className={cn(
                  "flex items-start gap-3 border-l-2 py-1.5 pl-3 transition-colors duration-200",
                  current ? "border-crt bg-sage" : reached ? "border-crt/40" : "border-line",
                )}
              >
                <span
                  className={cn(
                    "text-2xs mt-0.5 w-[94px] shrink-0 font-mono tracking-[0.04em]",
                    reached ? "text-bone font-medium" : "text-steel-dim",
                  )}
                >
                  {stage.label}
                </span>
                <span
                  className={cn(
                    "text-sm leading-snug transition-colors",
                    reached ? "text-steel" : "text-steel-dim",
                  )}
                >
                  {stage.detail}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
