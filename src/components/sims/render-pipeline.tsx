"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { observe } from "@/lib/observation-log";
import { ControlGroup, Readout, Segmented, SimFrame } from "./sim-frame";

type Stage = "parse" | "style" | "layout" | "paint" | "raster" | "composite";

const STAGES: { id: Stage; label: string; thread: "main" | "compositor" | "raster" }[] = [
  { id: "parse", label: "DOM / CSSOM", thread: "main" },
  { id: "style", label: "Style", thread: "main" },
  { id: "layout", label: "Layout", thread: "main" },
  { id: "paint", label: "Paint", thread: "main" },
  { id: "raster", label: "Raster", thread: "raster" },
  { id: "composite", label: "Composite", thread: "compositor" },
];

type Mutation = {
  id: string;
  label: string;
  code: string;
  invalidates: Stage[];
  cost: number;
  note: string;
};

const MUTATIONS: Mutation[] = [
  {
    id: "width",
    label: "width",
    code: "el.style.width = '500px'",
    invalidates: ["style", "layout", "paint", "raster", "composite"],
    cost: 9.4,
    note: "Geometry changed, so the box and potentially every box after it must be laid out again.",
  },
  {
    id: "top",
    label: "top",
    code: "el.style.top = '40px'",
    invalidates: ["style", "layout", "paint", "raster", "composite"],
    cost: 8.1,
    note: "Positioned offsets are layout inputs. Same cost as width, despite looking like movement.",
  },
  {
    id: "font-size",
    label: "font-size",
    code: "el.style.fontSize = '18px'",
    invalidates: ["style", "layout", "paint", "raster", "composite"],
    cost: 11.2,
    note: "Text metrics change, so line breaking and every dependent box must be recomputed.",
  },
  {
    id: "background",
    label: "background-color",
    code: "el.style.background = '#1b5e20'",
    invalidates: ["style", "paint", "raster", "composite"],
    cost: 3.2,
    note: "Nothing moved, so layout is skipped, but the display list must be re-recorded and re-rastered.",
  },
  {
    id: "box-shadow",
    label: "box-shadow",
    code: "el.style.boxShadow = '0 8px 24px #000'",
    invalidates: ["style", "paint", "raster", "composite"],
    cost: 5.6,
    note: "Paint-only, but large blurs are expensive to rasterise, especially at high device pixel ratios.",
  },
  {
    id: "transform",
    label: "transform",
    code: "el.style.transform = 'translateX(50px)'",
    invalidates: ["style", "composite"],
    cost: 0.4,
    note: "On a composited layer this is a matrix change. No layout, no paint, no re-raster.",
  },
  {
    id: "opacity",
    label: "opacity",
    code: "el.style.opacity = '0.5'",
    invalidates: ["style", "composite"],
    cost: 0.3,
    note: "Compositor-only, like transform. Both keep animating while the main thread is blocked.",
  },
  {
    id: "scroll",
    label: "scroll",
    code: "window.scrollBy(0, 200)",
    invalidates: ["composite"],
    cost: 0.2,
    note: "Scrolling is a compositor operation, unless a non-passive wheel/touch listener forces it onto the main thread.",
  },
  {
    id: "classlist",
    label: "add class",
    code: "el.classList.add('open')",
    invalidates: ["style", "layout", "paint", "raster", "composite"],
    cost: 7.8,
    note: "Cost depends on what the class changes. Assume the worst until you have measured it.",
  },
  {
    id: "read",
    label: "read offsetHeight",
    code: "const h = el.offsetHeight",
    invalidates: ["style", "layout"],
    cost: 6.9,
    note: "A read forces pending style and layout to flush immediately. Inside a write loop, this is layout thrashing.",
  },
];

const THREAD_LABEL = {
  main: "MAIN THREAD",
  raster: "RASTER WORKERS",
  compositor: "COMPOSITOR THREAD",
};

export default function RenderPipelineSim() {
  const [id, setId] = useState(MUTATIONS[0].id);
  const mutation = MUTATIONS.find((m) => m.id === id) ?? MUTATIONS[0];
  const mainThreadStages = mutation.invalidates.filter(
    (s) => STAGES.find((stage) => stage.id === s)?.thread === "main",
  );

  return (
    <SimFrame
      code="BENCH-01A"
      title="Pipeline invalidation"
      status={mutation.cost > 5 ? "EXPENSIVE" : mutation.cost > 1 ? "MODERATE" : "CHEAP"}
      controls={
        <ControlGroup label="Mutation">
          <Segmented
            value={id}
            columns={1}
            onChange={(next) => {
              setId(next);
              const mutated = MUTATIONS.find((m) => m.id === next);
              if (!mutated) return;
              observe("USER ACTION", mutated.code);
              observe("BROWSER MODEL", `${mutated.invalidates.join(" → ")} invalidated`);
              observe("MEASUREMENT", `${mutated.cost.toFixed(1)}ms of the 16.7ms frame budget`);
            }}
            options={MUTATIONS.map((m) => ({ value: m.id, label: m.label }))}
          />
        </ControlGroup>
      }
      readout={
        <Readout
          rows={[
            ["Stages invalidated", mutation.invalidates.length],
            ["Main-thread stages", mainThreadStages.length],
            [
              "Modelled frame cost",
              <span
                className={
                  mutation.cost > 8 ? "text-rust" : mutation.cost > 3 ? "text-amber" : "text-crt"
                }
                key="c"
              >
                {mutation.cost.toFixed(1)}ms
              </span>,
            ],
            ["Frame budget (60Hz)", "16.7ms"],
          ]}
        />
      }
      note="Chromium-flavoured educational model. Gecko and WebKit organise the same work differently."
    >
      <div className="space-y-4 p-4">
        <pre className="border-line bg-ink-900 text-paper/85 border px-3 py-2 font-mono text-xs">
          {mutation.code}
        </pre>

        <ol className="grid gap-2 sm:grid-cols-6">
          {STAGES.map((stage) => {
            const hit = mutation.invalidates.includes(stage.id);
            return (
              <li
                key={stage.id}
                className={cn(
                  "relative flex flex-col gap-1 border px-2 py-3 transition-colors",
                  hit
                    ? stage.thread === "main"
                      ? "border-rust/60 bg-rust/10"
                      : "border-crt/50 bg-crt/10"
                    : "border-line bg-ink-900/40",
                )}
              >
                <span
                  className={cn(
                    "text-2xs font-medium tracking-[0.1em] uppercase",
                    hit ? (stage.thread === "main" ? "text-rust" : "text-crt") : "text-steel-dim",
                  )}
                >
                  {stage.label}
                </span>
                <span className="text-2xs text-steel-dim/70 font-mono tracking-[0.08em] uppercase">
                  {hit ? "re-runs" : "skipped"}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="grid gap-2 sm:grid-cols-3">
          {(["main", "raster", "compositor"] as const).map((thread) => {
            const busy = mutation.invalidates.some(
              (s) => STAGES.find((stage) => stage.id === s)?.thread === thread,
            );
            return (
              <div
                key={thread}
                className={cn(
                  "text-2xs flex items-center justify-between border px-3 py-2 font-medium tracking-[0.1em] uppercase",
                  busy
                    ? "border-amber/40 bg-amber/[0.07] text-amber"
                    : "border-line text-steel-dim",
                )}
              >
                {THREAD_LABEL[thread]}
                <span>{busy ? "BUSY" : "IDLE"}</span>
              </div>
            );
          })}
        </div>

        <div>
          <div className="text-2xs text-steel-dim mb-1 flex justify-between font-medium tracking-[0.08em] uppercase">
            <span>Frame budget</span>
            <span>{((mutation.cost / 16.7) * 100).toFixed(0)}% used</span>
          </div>
          <div className="border-line bg-ink-900 h-3 w-full border">
            <div
              className={cn(
                "h-full",
                mutation.cost > 10 ? "bg-rust/70" : mutation.cost > 4 ? "bg-amber/70" : "bg-crt/60",
              )}
              style={{ width: `${Math.min(100, (mutation.cost / 16.7) * 100)}%` }}
            />
          </div>
        </div>

        <p className="text-steel text-sm leading-relaxed">{mutation.note}</p>
      </div>
    </SimFrame>
  );
}
