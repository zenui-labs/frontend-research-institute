"use client";

import { useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isSoundEnabled, setSoundEnabled, subscribeSound } from "@/lib/sound";
import { cn } from "@/lib/cn";

export function SoundToggle() {
  const enabled = useSyncExternalStore(
    (listener) => subscribeSound(listener),
    isSoundEnabled,
    () => false,
  );

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      title={`Laboratory sound ${enabled ? "on" : "off"}`}
      aria-label={`Laboratory sound ${enabled ? "on" : "off"}`}
      onClick={() => setSoundEnabled(!enabled)}
      className={cn(
        "rounded-full border p-2 transition-colors",
        enabled
          ? "border-crt/40 text-crt hover:border-crt/70"
          : "border-line text-steel hover:border-line-bright hover:text-bone",
      )}
    >
      {enabled ? <Volume2 size={15} aria-hidden /> : <VolumeX size={15} aria-hidden />}
    </button>
  );
}
