"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Plus, RotateCcw, SkipForward, X, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { play } from "@/lib/sound";

/**
 * The hero console. Nothing here plays by itself, every reading on screen is
 * the result of something the visitor did. Each tab is a compressed version of
 * a full bench elsewhere in the institute.
 */

type TabId = "event-loop" | "rendering" | "layout" | "vitals" | "network";

const TABS: { id: TabId; label: string; prompt: string; href: string }[] = [
  {
    id: "event-loop",
    label: "Event loop",
    prompt: "Build a program. Then step through it.",
    href: "/experiments/event-loop-investigation",
  },
  {
    id: "rendering",
    label: "Rendering",
    prompt: "Change a property. See what it invalidates.",
    href: "/experiments/rendering-pipeline-investigation",
  },
  {
    id: "layout",
    label: "Layout",
    prompt: "Make z-index: 999999 lose. It takes one declaration.",
    href: "/experiments/why-z-index-999999-loses",
  },
  {
    id: "vitals",
    label: "Performance",
    prompt: "Fix the terrible website. Some fixes do nothing.",
    href: "/experiments/save-the-terrible-website",
  },
  {
    id: "network",
    label: "Networking",
    prompt: "Find the variable your page is actually bound by.",
    href: "/experiments/why-a-fast-network-still-feels-slow",
  },
];

export function HeroInstrument() {
  const [tab, setTab] = useState<TabId>("event-loop");
  const active = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <section
      className="flex h-full min-h-[560px] flex-col lg:min-h-[620px]"
      aria-label="Interactive console"
    >
      <header className="border-line flex flex-wrap items-center gap-1 border-b pb-3">
        <div
          className="flex flex-wrap items-center gap-1"
          role="tablist"
          aria-label="Console modes"
        >
          {TABS.map((item) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={item.id === tab}
              onClick={() => {
                setTab(item.id);
                play("click");
              }}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs transition-colors",
                item.id === tab
                  ? "bg-crt text-ink-950 font-medium"
                  : "text-steel hover:bg-ink-700 hover:text-bone",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="pt-7">
        <p className="font-display text-2xl font-semibold text-balance">{active.prompt}</p>
      </div>

      <div className="flex-1 py-6">
        {tab === "event-loop" ? <EventLoopPanel /> : null}
        {tab === "rendering" ? <RenderingPanel /> : null}
        {tab === "layout" ? <LayoutPanel /> : null}
        {tab === "vitals" ? <VitalsPanel /> : null}
        {tab === "network" ? <NetworkPanel /> : null}
      </div>

      <footer className="border-line border-t pt-4">
        <Link
          href={active.href}
          className="text-crt inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
        >
          Open the full bench
          <ArrowRight size={13} aria-hidden />
        </Link>
      </footer>
    </section>
  );
}

/* ------------------------------------------------------------ event loop */

type StatementKind = "log" | "micro" | "task";

const STATEMENT_META: Record<StatementKind, { code: (label: string) => string; queue: string }> = {
  log: { code: (l) => `console.log("${l}")`, queue: "runs now" },
  micro: { code: (l) => `Promise.resolve().then(() => log("${l}"))`, queue: "microtask" },
  task: { code: (l) => `setTimeout(() => log("${l}"))`, queue: "task" },
};

type Statement = { id: number; kind: StatementKind; label: string };

const DEFAULT_PROGRAM: Statement[] = [
  { id: 1, kind: "log", label: "A" },
  { id: 2, kind: "micro", label: "B" },
  { id: 3, kind: "task", label: "C" },
  { id: 4, kind: "log", label: "D" },
];

function EventLoopPanel() {
  const [program, setProgram] = useState<Statement[]>(DEFAULT_PROGRAM);
  const [step, setStep] = useState(0);

  // The whole execution is derived from the program: sync pass, then the
  // microtask checkpoint drains fully, then one task per turn of the loop.
  const frames = useMemo(() => {
    const micro = program.filter((s) => s.kind === "micro");
    const tasks = program.filter((s) => s.kind === "task");

    type Frame = { stack: string[]; micro: string[]; tasks: string[]; out: string[]; note: string };
    const out: string[] = [];
    const queuedMicro: string[] = [];
    const queuedTasks: string[] = [];
    const list: Frame[] = [];

    for (const statement of program) {
      if (statement.kind === "log") out.push(statement.label);
      if (statement.kind === "micro") queuedMicro.push(`log("${statement.label}")`);
      if (statement.kind === "task") queuedTasks.push(`log("${statement.label}")`);
      list.push({
        stack: ["<script>", STATEMENT_META[statement.kind].code(statement.label)],
        micro: [...queuedMicro],
        tasks: [...queuedTasks],
        out: [...out],
        note:
          statement.kind === "log"
            ? "Synchronous, it runs on the spot."
            : statement.kind === "micro"
              ? "Queued as a microtask. It waits for the stack to empty."
              : "Queued as a task. It waits for the next turn of the loop.",
      });
    }

    list.push({
      stack: [],
      micro: [...queuedMicro],
      tasks: [...queuedTasks],
      out: [...out],
      note: "Stack empty. The microtask checkpoint begins and drains completely.",
    });

    for (const item of micro) {
      queuedMicro.shift();
      out.push(item.label);
      list.push({
        stack: [`log("${item.label}")`],
        micro: [...queuedMicro],
        tasks: [...queuedTasks],
        out: [...out],
        note: "A microtask runs. Anything it queues would also run in this checkpoint.",
      });
    }

    for (const item of tasks) {
      queuedTasks.shift();
      out.push(item.label);
      list.push({
        stack: [`log("${item.label}")`],
        micro: [],
        tasks: [...queuedTasks],
        out: [...out],
        note: "One task per turn, after every microtask, and after a rendering opportunity.",
      });
    }

    list.push({
      stack: [],
      micro: [],
      tasks: [],
      out: [...out],
      note: `Finished. Output: ${out.join(" ") || "nothing"}.`,
    });

    return list;
  }, [program]);

  const frame = frames[Math.min(step, frames.length - 1)];
  const atEnd = step >= frames.length - 1;
  const nextLabel = String.fromCharCode(65 + program.length);

  function add(kind: StatementKind) {
    if (program.length >= 6) return;
    setProgram((p) => [...p, { id: Date.now(), kind, label: nextLabel }]);
    setStep(0);
    play("click");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(STATEMENT_META) as StatementKind[]).map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => add(kind)}
            disabled={program.length >= 6}
            className="bg-ink-700 text-2xs text-steel hover:bg-sage hover:text-crt inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono transition-colors disabled:opacity-40"
          >
            <Plus size={10} aria-hidden />
            {kind === "log" ? "log()" : kind === "micro" ? "promise" : "setTimeout"}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setProgram(DEFAULT_PROGRAM);
            setStep(0);
          }}
          className="text-2xs text-steel-dim hover:text-bone ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono transition-colors"
        >
          <RotateCcw size={10} aria-hidden /> Reset
        </button>
      </div>

      <ol className="space-y-1">
        {program.map((statement, i) => (
          <li
            key={statement.id}
            className={cn(
              "mono-readout flex items-center gap-2 rounded-[20px] px-2.5 py-1.5 transition-colors",
              i === step ? "bg-sage text-crt" : "bg-ink-700 text-paper-dim",
            )}
          >
            <span className="text-2xs w-4 shrink-0 opacity-60">{i + 1}</span>
            <span className="truncate">{STATEMENT_META[statement.kind].code(statement.label)}</span>
            <button
              type="button"
              aria-label={`Remove statement ${i + 1}`}
              onClick={() => {
                setProgram((p) => p.filter((s) => s.id !== statement.id));
                setStep(0);
              }}
              className="text-steel-dim hover:text-rust ml-auto shrink-0 transition-colors"
            >
              <X size={11} aria-hidden />
            </button>
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-3 gap-2">
        {[
          { title: "Stack", items: frame.stack, tone: "bg-ink-850 text-bone" },
          { title: "Microtasks", items: frame.micro, tone: "bg-sage text-crt" },
          { title: "Tasks", items: frame.tasks, tone: "bg-butter text-amber" },
        ].map((column) => (
          <div key={column.title} className="bg-ink-700 min-h-[74px] rounded-[12px] p-2">
            <p className="label-tech mb-1.5">{column.title}</p>
            <ul className="space-y-1">
              {column.items.map((item, i) => (
                <li
                  key={`${item}-${i}`}
                  className={cn(
                    "text-2xs truncate rounded-[12px] px-1.5 py-0.5 font-mono",
                    column.tone,
                  )}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-ink-850 flex flex-wrap items-center gap-2 rounded-[12px] px-3 py-2">
        <span className="label-tech">Console</span>
        {frame.out.length === 0 ? (
          <span className="text-steel-dim text-xs">nothing yet</span>
        ) : (
          frame.out.map((line, i) => (
            <span
              key={`${line}-${i}`}
              className="bg-crt text-2xs text-ink-950 rounded-full px-2 py-0.5 font-mono"
            >
              {line}
            </span>
          ))
        )}
        <span className="ml-auto flex gap-1.5">
          <button
            type="button"
            onClick={() => {
              setStep((s) => Math.min(s + 1, frames.length - 1));
              play("beep");
            }}
            disabled={atEnd}
            className="bg-crt text-2xs text-ink-950 inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium disabled:opacity-40"
          >
            <SkipForward size={10} aria-hidden /> Step
          </button>
          <button
            type="button"
            onClick={() => setStep(0)}
            className="text-2xs text-steel-dim hover:text-bone rounded-full px-2 py-1 transition-colors"
          >
            Rewind
          </button>
        </span>
      </div>

      <p className="text-steel text-sm leading-relaxed">{frame.note}</p>
    </div>
  );
}

/* ------------------------------------------------------------- rendering */

const STAGES = ["Style", "Layout", "Paint", "Raster", "Composite"] as const;

const MUTATIONS = [
  {
    id: "width",
    label: "width",
    code: "el.style.width = '500px'",
    stages: 5,
    cost: 9.4,
    note: "Geometry changed, so layout re-runs, and everything after it.",
  },
  {
    id: "top",
    label: "top",
    code: "el.style.top = '40px'",
    stages: 5,
    cost: 8.1,
    note: "Offsets are layout inputs. Same cost as width, despite looking like movement.",
  },
  {
    id: "bg",
    label: "background",
    code: "el.style.background = '#2f6b4f'",
    stages: 4,
    cost: 3.2,
    note: "Nothing moved, so layout is skipped. The display list is still re-recorded.",
  },
  {
    id: "shadow",
    label: "box-shadow",
    code: "el.style.boxShadow = '0 8px 24px'",
    stages: 4,
    cost: 5.6,
    note: "Paint-only, but large blurs are expensive to rasterise.",
  },
  {
    id: "transform",
    label: "transform",
    code: "el.style.transform = 'translateX(50px)'",
    stages: 1,
    cost: 0.4,
    note: "A matrix on the compositor. No layout, no paint, no re-raster.",
  },
  {
    id: "opacity",
    label: "opacity",
    code: "el.style.opacity = '0.5'",
    stages: 1,
    cost: 0.3,
    note: "Compositor-only, like transform. It keeps animating while JavaScript blocks.",
  },
] as const;

function RenderingPanel() {
  const [id, setId] = useState<string>("width");
  const mutation = MUTATIONS.find((m) => m.id === id) ?? MUTATIONS[0];

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap gap-1.5">
        {MUTATIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setId(item.id);
              play("click");
            }}
            className={cn(
              "text-2xs rounded-full px-2.5 py-1 font-mono transition-colors",
              item.id === id ? "bg-crt text-ink-950" : "bg-ink-700 text-steel hover:text-bone",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <code className="bg-ink-700 mono-readout text-paper block rounded-[12px] px-3 py-2">
        {mutation.code}
      </code>

      <ol className="grid grid-cols-5 gap-1.5">
        {STAGES.map((stage, i) => {
          const hit = mutation.stages === 1 ? i === 4 : i < mutation.stages;
          return (
            <li
              key={stage}
              className={cn(
                "text-2xs rounded-[20px] px-1 py-3 text-center font-mono transition-colors",
                hit ? "bg-peach text-rust" : "bg-ink-700 text-steel-dim",
              )}
            >
              {stage}
            </li>
          );
        })}
      </ol>

      <div>
        <div className="text-steel mb-1.5 flex justify-between text-xs">
          <span>Frame cost</span>
          <span className="tabular-nums">{mutation.cost.toFixed(1)}ms of 16.7ms</span>
        </div>
        <div className="bg-ink-600 h-2 w-full overflow-hidden rounded-full">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-300",
              mutation.cost > 5 ? "bg-rust" : mutation.cost > 1 ? "bg-amber" : "bg-crt",
            )}
            style={{ width: `${(mutation.cost / 16.7) * 100}%` }}
          />
        </div>
      </div>

      <p className="text-steel text-sm leading-relaxed">{mutation.note}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- layout */

const WRAPPER_DECLARATIONS = [
  { id: "opacity", css: "opacity: 0.99", style: { opacity: 0.99 } },
  { id: "transform", css: "transform: translateZ(0)", style: { transform: "translateZ(0)" } },
  { id: "filter", css: "filter: blur(0px)", style: { filter: "blur(0px)" } },
  { id: "isolation", css: "isolation: isolate", style: { isolation: "isolate" as const } },
] as const;

function LayoutPanel() {
  const [on, setOn] = useState<string[]>([]);
  const applied = WRAPPER_DECLARATIONS.filter((d) => on.includes(d.id));
  const hasContext = applied.length > 0;

  const wrapperStyle = applied.reduce<React.CSSProperties>((acc, d) => ({ ...acc, ...d.style }), {
    position: "relative",
  });

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap gap-1.5">
        {WRAPPER_DECLARATIONS.map((declaration) => {
          const active = on.includes(declaration.id);
          return (
            <button
              key={declaration.id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setOn((prev) =>
                  prev.includes(declaration.id)
                    ? prev.filter((i) => i !== declaration.id)
                    : [...prev, declaration.id],
                );
                play("switch");
              }}
              className={cn(
                "text-2xs rounded-full px-2.5 py-1 font-mono transition-colors",
                active ? "bg-rust text-ink-950" : "bg-ink-700 text-steel hover:text-bone",
              )}
            >
              {declaration.css}
            </button>
          );
        })}
      </div>

      <div className="bg-ink-700 relative h-[142px] overflow-hidden rounded-[12px]">
        <div style={wrapperStyle} className="absolute inset-0">
          <div
            style={{ position: "absolute", zIndex: 999999, top: 16, left: 16 }}
            className="bg-sage flex h-[78px] w-[58%] flex-col justify-between rounded-[20px] px-3 py-2"
          >
            <span className="text-2xs text-crt font-mono">PANEL A</span>
            <span className="text-crt font-mono text-xs">z-index: 999999</span>
          </div>
        </div>
        <div
          style={{ position: "absolute", zIndex: 2, top: 48, left: "32%" }}
          className="bg-peach flex h-[78px] w-[58%] flex-col justify-between rounded-[20px] px-3 py-2"
        >
          <span className="text-2xs text-rust font-mono">PANEL B</span>
          <span className="text-rust font-mono text-xs">z-index: 2</span>
        </div>
      </div>

      <dl className="flex flex-wrap gap-x-8 gap-y-2">
        <div>
          <dt className="label-tech">Stacking context</dt>
          <dd className={cn("mt-0.5 font-mono text-xs", hasContext ? "text-rust" : "text-crt")}>
            {hasContext ? "yes, on the wrapper" : "none"}
          </dd>
        </div>
        <div>
          <dt className="label-tech">Painted on top</dt>
          <dd className={cn("mt-0.5 font-mono text-xs", hasContext ? "text-rust" : "text-crt")}>
            {hasContext ? "Panel B (2)" : "Panel A (999999)"}
          </dd>
        </div>
      </dl>

      <p className="text-steel text-sm leading-relaxed">
        {hasContext
          ? "The wrapper is now a stacking context, so 999999 is only compared inside it. The number did not shrink, it changed jurisdiction."
          : "Flat tree: both panels are compared directly, and the larger z-index wins. Switch any declaration on."}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- vitals */

const FIXES = [
  {
    id: "img",
    label: "Modern image formats at display size",
    lcp: -2.4,
    inp: 0,
    cls: 0,
    trap: false,
  },
  { id: "preload", label: "Preload the LCP image", lcp: -1.1, inp: 0, cls: 0, trap: false },
  { id: "lazy", label: 'Add loading="lazy" to every image', lcp: 0.9, inp: 0, cls: 0, trap: true },
  { id: "split", label: "Route-level code splitting", lcp: -0.7, inp: -190, cls: 0, trap: false },
  {
    id: "chunk",
    label: "Break up the 600ms hydration task",
    lcp: 0,
    inp: -380,
    cls: 0,
    trap: false,
  },
  {
    id: "dims",
    label: "Reserve space for images and embeds",
    lcp: 0,
    inp: 0,
    cls: -0.33,
    trap: false,
  },
] as const;

function VitalsPanel() {
  const [on, setOn] = useState<string[]>([]);
  const metrics = FIXES.filter((f) => on.includes(f.id)).reduce(
    (m, f) => ({ lcp: m.lcp + f.lcp, inp: m.inp + f.inp, cls: m.cls + f.cls }),
    { lcp: 7.8, inp: 840, cls: 0.42 },
  );
  const lcp = Math.max(0.9, metrics.lcp);
  const inp = Math.max(45, metrics.inp);
  const cls = Math.max(0, Number(metrics.cls.toFixed(2)));
  const saved = lcp <= 2.5 && inp <= 200 && cls <= 0.1;

  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "LCP", value: lcp, unit: "s", good: 2.5, max: 8 },
          { label: "INP", value: inp, unit: "ms", good: 200, max: 900 },
          { label: "CLS", value: cls, unit: "", good: 0.1, max: 0.5 },
        ].map((gauge) => {
          const ok = gauge.value <= gauge.good;
          return (
            <div key={gauge.label} className="bg-ink-700 rounded-[12px] p-2.5">
              <div className="flex items-baseline justify-between">
                <span className="label-tech">{gauge.label}</span>
                <span
                  className={cn("font-mono text-sm tabular-nums", ok ? "text-crt" : "text-rust")}
                >
                  {gauge.unit === ""
                    ? gauge.value.toFixed(2)
                    : gauge.unit === "s"
                      ? gauge.value.toFixed(1)
                      : Math.round(gauge.value)}
                  <span className="text-2xs ml-0.5 opacity-70">{gauge.unit}</span>
                </span>
              </div>
              <div className="bg-ink-600 mt-2 h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    ok ? "bg-crt" : "bg-rust",
                  )}
                  style={{ width: `${Math.min(100, (gauge.value / gauge.max) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <ul className="space-y-1">
        {FIXES.map((fix) => {
          const active = on.includes(fix.id);
          return (
            <li key={fix.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setOn((prev) =>
                    prev.includes(fix.id) ? prev.filter((i) => i !== fix.id) : [...prev, fix.id],
                  );
                  play(active ? "click" : fix.trap ? "error" : "beep");
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-[20px] px-3 py-1.5 text-left text-sm transition-colors",
                  active
                    ? fix.trap
                      ? "bg-peach text-rust"
                      : "bg-sage text-crt"
                    : "bg-ink-700 text-steel hover:text-bone",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "text-2xs flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                    active
                      ? fix.trap
                        ? "bg-rust text-ink-950"
                        : "bg-crt text-ink-950"
                      : "bg-ink-500 text-ink-700",
                  )}
                >
                  ✓
                </span>
                {fix.label}
                {active && fix.trap ? (
                  <span className="text-2xs ml-auto">made it worse</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <p className={cn("text-sm leading-relaxed", saved ? "text-crt" : "text-steel")}>
        {saved
          ? "All three Core Web Vitals are in the good range. The intern has been informed."
          : "Toggle interventions. One of them is a trap that every team tries first."}
      </p>
    </div>
  );
}

/* --------------------------------------------------------------- network */

function NetworkPanel() {
  const [protocol, setProtocol] = useState<"h1" | "h3">("h1");
  const [rtt, setRtt] = useState(120);
  const [mbps, setMbps] = useState(15);

  const assets = 12;
  const perAsset = ((28 * 8) / (mbps * 1000)) * 1000;
  const lanes = protocol === "h1" ? 6 : assets;

  const bars = Array.from({ length: assets }, (_, i) => {
    const wave = Math.floor(i / lanes);
    const start = wave * (rtt + perAsset);
    const duration = rtt + perAsset * (protocol === "h1" ? 1 : 1.6);
    return { start, duration };
  });
  const total = Math.max(...bars.map((b) => b.start + b.duration));

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center gap-2">
        {(["h1", "h3"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setProtocol(value);
              play("switch");
            }}
            className={cn(
              "text-2xs rounded-full px-3 py-1 font-mono transition-colors",
              protocol === value ? "bg-crt text-ink-950" : "bg-ink-700 text-steel hover:text-bone",
            )}
          >
            {value === "h1" ? "HTTP/1.1" : "HTTP/3"}
          </button>
        ))}
        <span className="text-2xs text-steel ml-auto flex items-center gap-1.5 font-mono">
          <Zap size={11} aria-hidden /> {Math.round(total)}ms
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-steel mb-1 flex justify-between text-xs">
            <span>Latency</span>
            <span className="font-mono tabular-nums">{rtt}ms</span>
          </span>
          <input
            type="range"
            min={10}
            max={320}
            step={10}
            value={rtt}
            onChange={(e) => setRtt(Number(e.target.value))}
            className="range-crt"
            style={{ ["--fill" as string]: `${((rtt - 10) / 310) * 100}%` }}
          />
        </label>
        <label className="block">
          <span className="text-steel mb-1 flex justify-between text-xs">
            <span>Bandwidth</span>
            <span className="font-mono tabular-nums">{mbps}Mbps</span>
          </span>
          <input
            type="range"
            min={2}
            max={200}
            step={2}
            value={mbps}
            onChange={(e) => setMbps(Number(e.target.value))}
            className="range-crt"
            style={{ ["--fill" as string]: `${((mbps - 2) / 198) * 100}%` }}
          />
        </label>
      </div>

      <div className="bg-ink-700 space-y-1 rounded-[12px] p-2.5">
        {bars.map((bar, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-2xs text-steel-dim w-5 font-mono tabular-nums">{i + 1}</span>
            <div className="bg-ink-600 relative h-1.5 flex-1 overflow-hidden rounded-full">
              <div
                className={cn(
                  "absolute top-0 h-full rounded-full transition-all duration-300",
                  protocol === "h3" ? "bg-crt" : "bg-amber",
                )}
                style={{
                  left: `${(bar.start / total) * 100}%`,
                  width: `${Math.max(2, (bar.duration / total) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-steel text-sm leading-relaxed">
        {protocol === "h1"
          ? "Six connections per origin. Everything after the sixth request waits for a lane."
          : "One connection, twelve streams. Raising bandwidth barely moves the total; dropping latency moves all of it."}
      </p>
    </div>
  );
}
