"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, RotateCcw, X } from "lucide-react";
import type { Experiment, Laboratory, SimKey } from "@/content/types";
import { cn } from "@/lib/cn";
import { clearObservations, observe } from "@/lib/observation-log";
import { record } from "@/lib/progress";
import { useReducedMotion } from "@/lib/reduced-motion";
import { play } from "@/lib/sound";
import { SimMount } from "@/components/sims/sim-mount";
import { ObservationLog } from "./observation-log";

type Phase = "briefing" | "booting" | "running" | "complete";

const BOOT_LINES = ["Experiment initialising", "Calibrating variables", "Instrument online"];

export function LabShell({
  experiment,
  lab,
  sims,
}: {
  experiment: Experiment;
  lab?: Laboratory;
  sims: SimKey[];
}) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("briefing");
  const [bootStep, setBootStep] = useState(0);
  const [prediction, setPrediction] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "booting") return;
    if (reduced) {
      const frame = requestAnimationFrame(() => setPhase("running"));
      return () => cancelAnimationFrame(frame);
    }
    const timers = BOOT_LINES.map((_, i) =>
      window.setTimeout(() => setBootStep(i + 1), 200 * (i + 1)),
    );
    timers.push(window.setTimeout(() => setPhase("running"), 200 * (BOOT_LINES.length + 1)));
    return () => timers.forEach(window.clearTimeout);
  }, [phase, reduced]);

  useEffect(() => {
    if (phase !== "running") return;
    clearObservations();
    observe("BROWSER MODEL", "instrument ready, variables at default");
  }, [phase]);

  const statusLabel =
    phase === "running" ? "Running" : phase === "complete" ? "Complete" : "Standby";

  return (
    <div className="flex min-h-[calc(100svh-5rem)] flex-col">
      <LabHeader experiment={experiment} lab={lab} phase={phase} statusLabel={statusLabel} />

      {phase === "briefing" ? (
        <Briefing
          experiment={experiment}
          lab={lab}
          prediction={prediction}
          onPrediction={setPrediction}
          onEnter={() => {
            setSubmitted(prediction.trim() || null);
            setPhase("booting");
            play("boot");
          }}
        />
      ) : null}

      {phase === "booting" ? (
        <div className="flex flex-1 items-center justify-center px-6">
          <ol className="space-y-2.5 font-mono text-sm">
            {BOOT_LINES.map((line, i) => (
              <li
                key={line}
                className={cn(
                  "flex items-center gap-3 transition-colors",
                  i < bootStep ? "text-crt" : "text-steel-dim/40",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    i < bootStep ? "bg-crt" : "bg-steel-dim/40",
                  )}
                />
                {line}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {phase === "running" || phase === "complete" ? (
        <Workstation
          experiment={experiment}
          sims={sims}
          prediction={submitted}
          complete={phase === "complete"}
          onConclude={() => {
            observe("RESULT", "researcher concluded the experiment");
            record.completeExperiment(experiment.id);
            setPhase("complete");
            play("complete");
          }}
          onReset={() => {
            clearObservations();
            observe("BROWSER MODEL", "instrument reset to defaults");
            setPhase("running");
          }}
        />
      ) : null}
    </div>
  );
}

function LabHeader({
  experiment,
  lab,
  phase,
  statusLabel,
}: {
  experiment: Experiment;
  lab?: Laboratory;
  phase: Phase;
  statusLabel: string;
}) {
  return (
    <header className="border-line bg-ink-900/80 sticky top-20 z-30 border-b backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1320px] items-center gap-4 px-4 py-3.5 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-steel-dim text-2xs tracking-[0.1em] uppercase">
            Laboratory · {lab?.name ?? experiment.lab}
          </p>
          <h1 className="font-display mt-1 truncate text-lg font-semibold">{experiment.title}</h1>
        </div>

        <span
          className={cn(
            "text-2xs hidden h-9 items-center gap-2 rounded-full px-3.5 tracking-[0.1em] uppercase sm:inline-flex",
            phase === "running"
              ? "bg-sage text-crt"
              : phase === "complete"
                ? "bg-butter text-amber"
                : "bg-ink-800 text-steel-dim",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              phase === "running" ? "led bg-crt" : "bg-current",
            )}
          />
          {statusLabel}
        </span>

        <Link
          href={`/experiments/${experiment.slug}`}
          className="border-line text-steel hover:border-line-bright hover:text-bone flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-sm transition-colors"
        >
          <X size={13} aria-hidden />
          <span className="hidden sm:inline">Exit</span>
        </Link>
      </div>
    </header>
  );
}

function Briefing({
  experiment,
  lab,
  prediction,
  onPrediction,
  onEnter,
}: {
  experiment: Experiment;
  lab?: Laboratory;
  prediction: string;
  onPrediction: (value: string) => void;
  onEnter: () => void;
}) {
  const facts: [string, string][] = [
    ["Laboratory", lab?.name ?? experiment.lab],
    ["Level", experiment.difficulty],
    ["Estimated time", `${experiment.estimatedMinutes} minutes`],
    ["Method", experiment.type.toLowerCase()],
  ];

  return (
    <div className="mx-auto grid w-full max-w-[1320px] flex-1 gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="max-w-[60ch]">
        <p className="text-steel-dim text-2xs font-medium tracking-[0.14em] uppercase">Briefing</p>

        <h2 className="font-display mt-5 text-3xl leading-tight font-semibold text-balance">
          {experiment.question.replace(/`/g, "")}
        </h2>

        <p className="text-steel mt-6 text-lg leading-relaxed">{experiment.summary}</p>

        <dl className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="label-tech">{label}</dt>
              <dd className="text-bone mt-1.5 text-sm">{value}</dd>
            </div>
          ))}
          <div className="sm:col-span-2">
            <dt className="label-tech">Variables under observation</dt>
            <dd className="text-steel mt-2 flex flex-wrap gap-1.5">
              {experiment.concepts.map((concept) => (
                <span key={concept} className="bg-ink-800 rounded-full px-2.5 py-1 text-xs">
                  {concept}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>

      <aside className="bg-ink-850 border-line h-fit rounded-[24px] border p-6 lg:sticky lg:top-44">
        <p className="text-steel-dim text-2xs font-medium tracking-[0.14em] uppercase">
          Before you begin
        </p>

        <label htmlFor="prediction" className="font-display mt-4 block text-lg font-semibold">
          What do you expect to happen?
        </label>
        <input
          id="prediction"
          value={prediction}
          onChange={(event) => onPrediction(event.target.value)}
          placeholder="Your prediction"
          className="no-focus-ring border-line focus:border-crt text-bone placeholder:text-steel-dim mt-4 w-full border-b bg-transparent py-2.5 text-base transition-colors outline-none"
        />

        <button
          type="button"
          onClick={onEnter}
          className="bg-crt text-ink-950 mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-colors hover:bg-[#7bf0b4]"
        >
          Enter the laboratory <ArrowRight size={14} aria-hidden />
        </button>

        <p className="text-steel-dim mt-4 text-xs leading-relaxed">
          Your prediction stays in this browser and is shown beside the result.
        </p>
      </aside>
    </div>
  );
}

function Workstation({
  experiment,
  sims,
  prediction,
  complete,
  onConclude,
  onReset,
}: {
  experiment: Experiment;
  sims: SimKey[];
  prediction: string | null;
  complete: boolean;
  onConclude: () => void;
  onReset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-4 py-6 sm:px-6">
      <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_312px]">
        <div className="min-w-0 space-y-6">
          {sims.map((sim) => (
            <SimMount key={sim} sim={sim} />
          ))}
        </div>

        <aside className="space-y-6">
          <section className="bg-ink-850 border-line rounded-[24px] border p-5">
            <p className="text-steel-dim text-2xs font-medium tracking-[0.14em] uppercase">
              Objective
            </p>
            <p className="text-steel mt-3 text-sm leading-relaxed">
              {experiment.hypothesis ?? experiment.summary}
            </p>

            {prediction ? (
              <div className="border-line mt-5 border-t pt-4">
                <p className="text-steel-dim text-2xs font-medium tracking-[0.14em] uppercase">
                  Your prediction
                </p>
                <p className="text-amber mt-2 text-sm">{prediction}</p>
              </div>
            ) : null}
          </section>

          <section className="bg-ink-850 border-line rounded-[24px] border p-5">
            <p className="text-steel-dim text-2xs font-medium tracking-[0.14em] uppercase">
              Session
            </p>
            <div className="mt-4 space-y-2.5">
              {complete ? (
                <button
                  type="button"
                  onClick={onReset}
                  className="border-line text-steel hover:border-line-bright hover:text-bone flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors"
                >
                  <RotateCcw size={13} aria-hidden /> Run again
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onConclude}
                  className="bg-crt text-ink-950 w-full rounded-full px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#7bf0b4]"
                >
                  Conclude experiment
                </button>
              )}
              <Link
                href={`/experiments/${experiment.slug}#explanation`}
                className="border-line text-steel hover:border-line-bright hover:text-bone flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors"
              >
                Read the findings <ArrowRight size={13} aria-hidden />
              </Link>
            </div>
          </section>
        </aside>
      </div>

      {complete ? (
        <section className="bg-ink-850 border-line mt-6 rounded-[24px] border p-8">
          <p className="text-crt text-2xs font-medium tracking-[0.14em] uppercase">
            Observation confirmed
          </p>
          <p className="text-bone mt-4 max-w-3xl text-xl leading-relaxed">
            {experiment.hypothesis ?? experiment.summary}
          </p>
          <p className="text-steel mt-4 max-w-2xl text-sm leading-relaxed">
            The finding is recorded against your research ID. The full explanation, including the
            edge cases this instrument does not model, is in the dossier.
          </p>
        </section>
      ) : null}

      <ObservationLog className="bg-ink-850 border-line mt-6 rounded-[24px] border" />
    </div>
  );
}
