"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[FRI] research system failure", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-col items-center px-4 py-24 text-center sm:px-6">
      <pre className="border-rust/50 bg-ink-850 text-rust w-full max-w-lg rounded-[24px] border px-5 py-6 text-left font-mono text-xs leading-relaxed">
        {`┌──────────────────────────────┐
│ RESEARCH SYSTEM FAILURE │
│ │
│ Something went unexpectedly │
│ wrong. │
│ │
│ Error ID: FRI-ERR-042 │
│ │
│ The intern has been notified.│
└──────────────────────────────┘`}
      </pre>

      {error.digest ? (
        <p className="text-2xs text-steel-dim mt-4 font-medium tracking-[0.08em] uppercase">
          Digest: {error.digest}
        </p>
      ) : null}

      <p className="text-steel mt-6 max-w-md text-base leading-relaxed">
        The experiment has been halted for your safety. Nothing was lost, your research record lives
        in this browser and is unaffected.
      </p>

      <button
        type="button"
        onClick={reset}
        className="border-crt/45 bg-crt/10 text-2xs text-crt hover:bg-crt/20 mt-8 border px-4 py-2.5 font-medium tracking-[0.08em] uppercase transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
