"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/reduced-motion";

/** Counts to `value` once, when the element first enters the viewport. */
export function CountUp({
  value,
  duration = 1100,
  format = (n: number) => n.toLocaleString("en-US"),
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;

    if (reduced || typeof IntersectionObserver === "undefined") {
      // Land on the final value after paint rather than during the effect.
      frame = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const run = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          // easeOutExpo, fast, then settles
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          setDisplay(Math.round(value * eased));
          if (progress < 1) frame = requestAnimationFrame(run);
        };
        frame = requestAnimationFrame(run);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration, reduced]);

  return (
    <span ref={ref} className="tabular-nums">
      {format(display)}
    </span>
  );
}
