"use client";

import { useEffect } from "react";
import { Check, CircleDashed } from "lucide-react";
import { record, useHydrated, useProgress } from "@/lib/progress";
import { play } from "@/lib/sound";
import { RetroButton } from "@/components/ui/retro-button";
import type { LabSlug } from "@/content/types";

export function CompleteExperimentButton({ id }: { id: string }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const done = progress.completedExperiments.includes(id);

  return (
    <RetroButton
      variant={done ? "ghost" : "primary"}
      onClick={() => {
        if (done) return;
        record.completeExperiment(id);
        play("complete");
      }}
      aria-pressed={done}
    >
      {done ? <Check size={12} aria-hidden /> : <CircleDashed size={12} aria-hidden />}
      {hydrated && done ? "Logged in your record" : "Mark experiment complete"}
    </RetroButton>
  );
}

export function SolveCaseButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const progress = useProgress();
  const done = progress.solvedCases.includes(id);

  return (
    <RetroButton
      variant={done ? "ghost" : "primary"}
      disabled={disabled}
      onClick={() => {
        if (done) return;
        record.solveCase(id);
        play("complete");
      }}
      aria-pressed={done}
    >
      {done ? <Check size={12} aria-hidden /> : null}
      {done ? "Case closed in your record" : "Close the case"}
    </RetroButton>
  );
}

export function BustMythButton({ id }: { id: string }) {
  const progress = useProgress();
  const done = progress.bustedMyths.includes(id);

  return (
    <RetroButton
      variant={done ? "ghost" : "primary"}
      size="sm"
      onClick={() => {
        if (done) return;
        record.bustMyth(id);
        play("complete");
      }}
      aria-pressed={done}
    >
      {done ? <Check size={12} aria-hidden /> : null}
      {done ? "Investigated" : "Log as investigated"}
    </RetroButton>
  );
}

/** Silent trackers: reading counts as research. */
export function TrackDossierRead({ id }: { id: string }) {
  useEffect(() => {
    const timer = window.setTimeout(() => record.readDossier(id), 8000);
    return () => window.clearTimeout(timer);
  }, [id]);
  return null;
}

export function TrackLabVisit({ slug }: { slug: LabSlug }) {
  useEffect(() => {
    record.visitLab(slug);
  }, [slug]);
  return null;
}
