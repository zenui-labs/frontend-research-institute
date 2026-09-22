"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/reduced-motion";
import { play } from "@/lib/sound";

const LINES = [
  "Research database",
  "Browser models",
  "Experiment engine",
  "Laboratory environment",
  "Calibrating JavaScript engine",
];

const SESSION_KEY = "fri.booted";

export function BootSequence() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    let booted = true;
    try {
      booted = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      booted = false;
    }
    if (booted) return;
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* private mode: the boot sequence simply runs again next time */
    }
    // Enter after the first paint: the page underneath is already rendered,
    // so the boot screen is theatre rather than a blocking loading state.
    const frame = requestAnimationFrame(() => {
      setActive(true);
      play("boot");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!active) return;
    const pace = reduced ? 90 : 320;
    const list = timers.current;
    LINES.forEach((_, i) => {
      list.push(window.setTimeout(() => setStep(i + 1), pace * (i + 1)));
    });
    list.push(window.setTimeout(() => setLeaving(true), pace * (LINES.length + 1.2)));
    list.push(window.setTimeout(() => setActive(false), pace * (LINES.length + 2)));
    return () => {
      list.forEach(window.clearTimeout);
      list.length = 0;
    };
  }, [active, reduced]);

  if (!active) return null;

  return (
    <div
      className={`bg-ink-900 fixed inset-0 z-200 flex items-center justify-center px-6 transition-opacity duration-500 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="border-line bg-ink-850 shadow-panel-lg relative w-full max-w-md rounded-[24px] border p-7">
        <p className="text-2xs text-bone mb-7 font-mono leading-relaxed font-medium tracking-[0.06em] uppercase">
          Frontend Research Institute
          <br />
          <span className="text-steel">Initialising laboratory…</span>
        </p>

        <div className="border-line bg-ink-950 mb-6 h-3 w-full overflow-hidden rounded-full border">
          <div
            className="bg-peach h-full transition-[width] duration-300"
            style={{ width: `${(step / LINES.length) * 100}%` }}
          />
        </div>

        <ul className="space-y-1.5 font-mono text-xs">
          {LINES.map((line, i) => (
            <li
              key={line}
              className={i < step ? "text-bone" : "text-steel-dim/60"}
              aria-hidden={i >= step}
            >
              <span className="mr-2">{i < step ? "✓" : i === step ? "⚠" : " "}</span>
              {line}
              {i === step ? "…" : ""}
            </li>
          ))}
        </ul>

        {step >= LINES.length ? (
          <p className="border-line bg-sage text-bone mt-7 rounded-[24px] border px-3 py-2 font-mono text-xs font-medium tracking-[0.06em] uppercase">
            System ready
            <br />
            <span className="caret">Welcome, researcher</span>
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => {
            setLeaving(true);
            window.setTimeout(() => setActive(false), 200);
          }}
          className="border-line bg-ink-800 text-2xs text-bone absolute -bottom-14 left-1/2 -translate-x-1/2 rounded-[24px] border px-3 py-1.5 font-mono font-medium tracking-[0.06em] uppercase shadow-none"
        >
          Skip boot sequence
        </button>
      </div>
    </div>
  );
}
