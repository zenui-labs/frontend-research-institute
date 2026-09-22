"use client";

import { useSyncExternalStore } from "react";

export type LogChannel = "USER ACTION" | "BROWSER MODEL" | "MEASUREMENT" | "RESULT";

export type Observation = {
  id: number;
  at: string;
  channel: LogChannel;
  message: string;
};

let entries: Observation[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function stamp(): string {
  const now = new Date();
  return [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

/** Benches call this as the user operates them; the lab console renders it. */
export function observe(channel: LogChannel, message: string): void {
  const last = entries[entries.length - 1];
  if (last && last.channel === channel && last.message === message) return;
  entries = [...entries.slice(-40), { id: nextId++, at: stamp(), channel, message }];
  emit();
}

export function clearObservations(): void {
  entries = [];
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const EMPTY: Observation[] = [];

export function useObservations(): Observation[] {
  return useSyncExternalStore(
    subscribe,
    () => entries,
    () => EMPTY,
  );
}
