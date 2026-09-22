"use client";

import { useEffect, useState } from "react";

/**
 * Tracks `prefers-reduced-motion` reactively. Starts pessimistic (`true`) so the
 * first client paint never fires an animation we would have to cancel.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return reduced;
}
