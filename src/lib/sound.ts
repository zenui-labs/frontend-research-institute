"use client";

/**
 * Synthesised laboratory sound. No audio files ship with the bundle: every
 * effect is a few oscillator/noise nodes, which keeps the cost at ~0 bytes and
 * means nothing can autoplay before the user has interacted with the page.
 */
export type SoundName = "click" | "switch" | "boot" | "beep" | "error" | "complete" | "type";

const STORAGE_KEY = "fri.sound.enabled";

let ctx: AudioContext | null = null;
let enabled = false;
let hydrated = false;

type Listener = (enabled: boolean) => void;
const listeners = new Set<Listener>();

function readPreference(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

export function hydrateSound(): boolean {
  if (!hydrated) {
    enabled = readPreference();
    hydrated = true;
  }
  return enabled;
}

export function isSoundEnabled(): boolean {
  return hydrated ? enabled : hydrateSound();
}

export function subscribeSound(listener: () => void): () => void {
  const wrapped: Listener = () => listener();
  listeners.add(wrapped);
  return () => {
    listeners.delete(wrapped);
  };
}

export function setSoundEnabled(next: boolean): void {
  enabled = next;
  hydrated = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
  } catch {
    /* storage unavailable, preference stays in-memory for this session */
  }
  if (next) void audioContext()?.resume();
  listeners.forEach((l) => l(next));
  if (next) play("switch");
}

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

type ToneSpec = {
  type: OscillatorType;
  from: number;
  to: number;
  duration: number;
  gain: number;
  delay?: number;
};

const RECIPES: Record<SoundName, ToneSpec[]> = {
  click: [{ type: "square", from: 880, to: 320, duration: 0.045, gain: 0.05 }],
  type: [{ type: "square", from: 1600, to: 1400, duration: 0.02, gain: 0.02 }],
  switch: [
    { type: "square", from: 220, to: 120, duration: 0.05, gain: 0.06 },
    { type: "triangle", from: 900, to: 600, duration: 0.05, gain: 0.03, delay: 0.04 },
  ],
  beep: [{ type: "sine", from: 1320, to: 1320, duration: 0.09, gain: 0.05 }],
  error: [
    { type: "sawtooth", from: 200, to: 90, duration: 0.22, gain: 0.06 },
    { type: "sawtooth", from: 150, to: 70, duration: 0.22, gain: 0.05, delay: 0.09 },
  ],
  complete: [
    { type: "sine", from: 660, to: 660, duration: 0.09, gain: 0.05 },
    { type: "sine", from: 880, to: 880, duration: 0.09, gain: 0.05, delay: 0.08 },
    { type: "sine", from: 1320, to: 1320, duration: 0.16, gain: 0.05, delay: 0.16 },
  ],
  boot: [
    { type: "sawtooth", from: 60, to: 420, duration: 0.55, gain: 0.05 },
    { type: "sine", from: 1200, to: 1800, duration: 0.2, gain: 0.03, delay: 0.42 },
  ],
};

export function play(name: SoundName): void {
  if (!isSoundEnabled()) return;
  const audio = audioContext();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();

  const now = audio.currentTime;
  for (const spec of RECIPES[name]) {
    const start = now + (spec.delay ?? 0);
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = spec.type;
    osc.frequency.setValueAtTime(spec.from, start);
    if (spec.to !== spec.from) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, spec.to), start + spec.duration);
    }
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(spec.gain, start + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + spec.duration);
    osc.connect(gain).connect(audio.destination);
    osc.start(start);
    osc.stop(start + spec.duration + 0.02);
  }
}
