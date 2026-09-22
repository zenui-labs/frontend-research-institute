"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { SimKey } from "@/content/types";

function BenchLoading() {
  return (
    <div className="panel flex min-h-[260px] flex-col items-center justify-center gap-3 px-6 py-10">
      <span className="text-2xs text-crt/80 font-medium tracking-[0.08em] uppercase">
        Initialising bench
      </span>
      <span className="bg-ink-600 h-1 w-40 overflow-hidden">
        <span className="bg-crt/70 block h-full w-1/3 animate-[sweep_1.2s_ease-in-out_infinite]" />
      </span>
      <span className="text-2xs text-steel-dim font-medium tracking-[0.08em] uppercase">
        Equipment warms up. Knowledge does not require it.
      </span>
    </div>
  );
}

/**
 * Every bench is code-split and client-only: a page of research content pays
 * nothing for a simulation the reader has not scrolled to.
 */
const REGISTRY: Record<SimKey, ComponentType> = {
  "stacking-context": dynamic(() => import("./stacking-context"), {
    ssr: false,
    loading: BenchLoading,
  }),
  "stacking-creators": dynamic(() => import("./stacking-creators"), {
    ssr: false,
    loading: BenchLoading,
  }),
  "box-overflow": dynamic(() => import("./box-overflow"), { ssr: false, loading: BenchLoading }),
  "intrinsic-sizing": dynamic(() => import("./intrinsic-sizing"), {
    ssr: false,
    loading: BenchLoading,
  }),
  "event-loop": dynamic(() => import("./event-loop"), { ssr: false, loading: BenchLoading }),
  coercion: dynamic(() => import("./coercion"), { ssr: false, loading: BenchLoading }),
  "closure-memory": dynamic(() => import("./closure-memory"), {
    ssr: false,
    loading: BenchLoading,
  }),
  "render-pipeline": dynamic(() => import("./render-pipeline"), {
    ssr: false,
    loading: BenchLoading,
  }),
  "url-journey": dynamic(() => import("./url-journey"), { ssr: false, loading: BenchLoading }),
  "react-render": dynamic(() => import("./react-render"), { ssr: false, loading: BenchLoading }),
  "react-keys": dynamic(() => import("./react-keys"), { ssr: false, loading: BenchLoading }),
  "state-placement": dynamic(() => import("./state-placement"), {
    ssr: false,
    loading: BenchLoading,
  }),
  "perf-rescue": dynamic(() => import("./perf-rescue"), { ssr: false, loading: BenchLoading }),
  "main-thread": dynamic(() => import("./main-thread"), { ssr: false, loading: BenchLoading }),
  "network-lab": dynamic(() => import("./network-lab"), { ssr: false, loading: BenchLoading }),
  "a11y-tree": dynamic(() => import("./a11y-tree"), { ssr: false, loading: BenchLoading }),
  "dependency-graph": dynamic(() => import("./dependency-graph"), {
    ssr: false,
    loading: BenchLoading,
  }),
  "same-origin": dynamic(() => import("./same-origin"), { ssr: false, loading: BenchLoading }),
  complexity: dynamic(() => import("./complexity"), { ssr: false, loading: BenchLoading }),
};

export function SimMount({ sim, caption }: { sim: SimKey; caption?: string }) {
  const Bench = REGISTRY[sim];
  if (!Bench) return null;
  return (
    <figure className="space-y-2">
      <Bench />
      {caption ? (
        <figcaption className="text-2xs text-steel-dim font-medium tracking-[0.08em] uppercase">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
