"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SimFrame({
  code,
  title,
  status,
  controls,
  children,
  readout,
  note,
}: {
  code: string;
  title: string;
  status?: string;
  controls?: ReactNode;
  children: ReactNode;
  readout?: ReactNode;
  note?: string;
}) {
  return (
    <section
      className="border-line bg-ink-850 overflow-hidden rounded-[24px] border"
      aria-label={title}
    >
      <header className="border-line flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
        <div className="flex items-baseline gap-3">
          <h3 className="font-display text-base font-semibold">{title}</h3>
          <span className="label-tech">{code}</span>
        </div>
        <span className="text-2xs text-steel flex items-center gap-2 font-medium tracking-[0.08em] uppercase">
          <span className="led bg-crt inline-block h-1.5 w-1.5 rounded-full" />
          {status ?? "Ready"}
        </span>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_268px]">
        <div className="order-2 min-w-0 lg:order-1">{children}</div>
        {controls ? (
          <div className="border-line bg-ink-900/60 order-1 border-b p-5 lg:order-2 lg:border-b-0 lg:border-l">
            {controls}
          </div>
        ) : null}
      </div>

      {readout ? (
        <div className="border-line bg-ink-900/60 text-paper-dim border-t px-5 py-4 text-sm">
          {readout}
        </div>
      ) : null}

      {note ? (
        <p className="border-line text-steel-dim border-t px-5 py-3 text-xs leading-relaxed">
          {note}
        </p>
      ) : null}
    </section>
  );
}

export function ControlGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="mb-6 last:mb-0">
      <legend className="label-tech mb-3">{label}</legend>
      <div className="space-y-3.5">{children}</div>
    </fieldset>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (next: number) => void;
}) {
  const fill = ((value - min) / (max - min)) * 100;

  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-steel text-xs">{label}</span>
        <span className="text-bone font-mono text-xs tabular-nums">
          {value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-crt"
        style={{ ["--fill" as string]: `${fill}%` }}
      />
    </label>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  columns = 2,
}: {
  label?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
  columns?: number;
}) {
  return (
    <div>
      {label ? <p className="label-tech mb-2">{label}</p> : null}
      <div
        role="radiogroup"
        aria-label={label}
        className={cn(
          "bg-ink-800 gap-1 rounded-[14px] p-1",
          columns === 1 ? "flex flex-col" : "grid",
        )}
        style={
          columns > 1 ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined
        }
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-[12px] px-2.5 py-2 text-xs transition-colors",
              value === option.value
                ? "bg-crt text-ink-950 font-medium"
                : "text-steel hover:bg-ink-700 hover:text-bone",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Readout({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
      {rows.map(([key, value]) => (
        <div key={key} className="flex items-baseline justify-between gap-4">
          <dt className="text-steel-dim text-xs">{key}</dt>
          <dd className="text-bone text-right font-mono text-xs tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Stage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative min-h-[280px] overflow-hidden p-6", className)}>{children}</div>
  );
}
