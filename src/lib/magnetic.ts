"use client";

import { useEffect, useRef } from "react";

/**
 * Magnetic pull: the element leans a few pixels toward the pointer and springs
 * back on leave. Listeners are attached to the node itself, so nothing is
 * re-created per render and no layout is ever triggered.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.24, max = 6) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function onMove(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !node) return;
      const rect = node.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      node.style.setProperty("--mx", `${Math.max(-max, Math.min(max, dx * strength))}px`);
      node.style.setProperty("--my", `${Math.max(-max, Math.min(max, dy * strength))}px`);
    }

    function reset() {
      node?.style.setProperty("--mx", "0px");
      node?.style.setProperty("--my", "0px");
    }

    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", reset);
    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", reset);
      reset();
    };
  }, [strength, max]);

  return ref;
}
