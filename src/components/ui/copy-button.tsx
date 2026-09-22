"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { play } from "@/lib/sound";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="text-2xs text-steel-dim hover:text-bone flex items-center gap-1.5 font-medium tracking-[0.08em] uppercase transition-colors"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          play("beep");
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          play("error");
        }
      }}
    >
      {copied ? <Check size={12} aria-hidden /> : <Copy size={12} aria-hidden />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
