"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { cn } from "@/lib/cn";
import { play } from "@/lib/sound";
import { observe } from "@/lib/observation-log";
import { RetroButton } from "@/components/ui/retro-button";
import { PROGRAMS, type LoopFrame, type Phase } from "./event-loop-programs";
import { ControlGroup, Segmented, SimFrame } from "./sim-frame";

const PHASE_STYLE: Record<Phase, string> = {
  sync: "text-bone",
  microtask: "text-crt",
  task: "text-amber",
  render: "text-signal",
  idle: "text-steel-dim",
};

const PHASE_LABEL: Record<Phase, string> = {
  sync: "SYNCHRONOUS",
  microtask: "MICROTASK CHECKPOINT",
  task: "TASK",
  render: "RENDER STEP",
  idle: "IDLE",
};

function Queue({
  title,
  items,
  tone,
  hint,
  reverse,
}: {
  title: string;
  items: string[];
  tone: string;
  hint: string;
  reverse?: boolean;
}) {
  const shown = reverse ? [...items].reverse() : items;
  return (
    <div className="border-line bg-ink-900/50 flex min-h-[150px] flex-col border">
      <div className="border-line flex items-baseline justify-between border-b px-3 py-1.5">
        <span className="text-2xs text-steel font-medium tracking-[0.08em] uppercase">{title}</span>
        <span className={cn("text-2xs font-mono tabular-nums", tone)}>{items.length}</span>
      </div>
      <ul className="flex flex-1 flex-col gap-1 p-2">
        {shown.length === 0 ? (
          <li className="text-2xs text-steel-dim/60 px-1 py-1 font-mono">empty</li>
        ) : (
          shown.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className={cn(
                "text-2xs truncate border px-2 py-1 font-mono",
                tone,
                "border-current/25 bg-current/5",
              )}
            >
              {item}
            </li>
          ))
        )}
      </ul>
      <p className="border-line text-2xs text-steel-dim/70 border-t px-3 py-1 font-mono tracking-[0.1em] uppercase">
        {hint}
      </p>
    </div>
  );
}

export default function EventLoopSim() {
  const [programId, setProgramId] = useState(PROGRAMS[0].id);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const program = PROGRAMS.find((p) => p.id === programId) ?? PROGRAMS[0];
  const frames: LoopFrame[] = program.frames;
  const current = frames[Math.min(step, frames.length - 1)];
  const atEnd = step >= frames.length - 1;

  useEffect(() => {
    if (!playing || atEnd) return;
    const id = window.setTimeout(() => {
      setStep(step + 1);
      if (step + 1 >= frames.length - 1) setPlaying(false);
    }, 1100);
    return () => window.clearTimeout(id);
  }, [playing, step, atEnd, frames.length]);

  function reset(next = programId) {
    setProgramId(next);
    setStep(0);
    setPlaying(false);
  }

  return (
    <SimFrame
      code="BENCH-03A"
      title="Event loop"
      status={PHASE_LABEL[current.phase]}
      controls={
        <>
          <ControlGroup label="Program">
            <Segmented
              value={programId}
              columns={1}
              onChange={(id) => reset(id)}
              options={PROGRAMS.map((p) => ({ value: p.id, label: p.label }))}
            />
          </ControlGroup>
          <ControlGroup label="Transport">
            <div className="flex flex-wrap gap-2">
              <RetroButton
                size="sm"
                variant={playing ? "danger" : "primary"}
                onClick={() => setPlaying((p) => !p)}
                disabled={atEnd}
              >
                {playing ? <Pause size={12} aria-hidden /> : <Play size={12} aria-hidden />}
                {playing ? "Pause" : "Run"}
              </RetroButton>
              <RetroButton
                size="sm"
                onClick={() => {
                  setPlaying(false);
                  const nextStep = Math.min(step + 1, frames.length - 1);
                  setStep(nextStep);
                  play("beep");
                  observe("BROWSER MODEL", frames[nextStep].note);
                }}
                disabled={atEnd}
              >
                <SkipForward size={12} aria-hidden /> Step
              </RetroButton>
              <RetroButton size="sm" onClick={() => reset()}>
                <RotateCcw size={12} aria-hidden /> Reset
              </RetroButton>
            </div>
            <p className="text-2xs text-steel-dim font-medium tracking-[0.08em]">
              STEP {step + 1} / {frames.length}
            </p>
          </ControlGroup>
        </>
      }
      readout={
        <p>
          <span className={cn("mr-2", PHASE_STYLE[current.phase])}>
            [{PHASE_LABEL[current.phase]}]
          </span>
          {current.note}
        </p>
      }
      note="Educational model of the HTML standard's processing model. Real browsers keep several task queues and prioritise input."
    >
      <div className="grid gap-4 p-4">
        <pre className="border-line bg-ink-900 text-paper/80 max-h-[170px] overflow-auto border px-3 py-2 font-mono text-xs leading-relaxed">
          {program.code}
        </pre>

        <div className="grid gap-3 sm:grid-cols-3">
          <Queue
            title="Call stack"
            items={current.stack}
            tone="text-bone"
            hint="LIFO, runs to completion"
            reverse
          />
          <Queue
            title="Microtasks"
            items={current.micro}
            tone="text-crt"
            hint="Drained fully every checkpoint"
          />
          <Queue
            title="Tasks"
            items={current.tasks}
            tone="text-amber"
            hint="One per turn of the loop"
          />
        </div>

        <div className="border-line bg-ink-900/50 border">
          <div className="border-line text-2xs text-steel border-b px-3 py-1.5 font-medium tracking-[0.08em] uppercase">
            Console
          </div>
          <div className="flex min-h-[46px] flex-wrap items-center gap-2 p-3">
            {current.output.length === 0 ? (
              <span className="text-2xs text-steel-dim/60 font-mono">no output yet</span>
            ) : (
              current.output.map((line, i) => (
                <span
                  key={`${line}-${i}`}
                  className="border-crt/30 bg-crt/10 text-crt border px-2 py-1 font-mono text-xs"
                >
                  {line}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </SimFrame>
  );
}
