"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { play } from "@/lib/sound";

type Props = {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  tone?: "crt" | "amber" | "rust";
};

const TONE = {
  crt: "bg-crt",
  amber: "bg-amber",
  rust: "bg-rust",
};

/** A physical toggle: the lever slides, the indicator lamp lights. */
export function MechanicalSwitch({
  label,
  hint,
  checked,
  onChange,
  disabled,
  tone = "crt",
}: Props) {
  const id = useId();
  return (
    <div className={cn("flex items-start gap-3", disabled && "opacity-45")}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => {
          play("switch");
          onChange(!checked);
        }}
        className={cn(
          "mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full border p-[2px] transition-colors",
          checked ? "justify-end border-transparent" : "border-line bg-ink-700 justify-start",
          checked && TONE[tone],
        )}
      >
        <span
          className={cn(
            "block h-3.5 w-3.5 rounded-full transition-colors",
            checked ? "bg-ink-950" : "bg-steel-dim",
          )}
        />
      </button>
      <label htmlFor={id} className="cursor-pointer leading-tight">
        <span className="text-bone block text-sm">{label}</span>
        {hint ? (
          <span className="text-steel-dim mt-0.5 block text-xs leading-snug">{hint}</span>
        ) : null}
      </label>
    </div>
  );
}
