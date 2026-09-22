import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-col items-center px-4 py-24 text-center sm:px-6">
      <pre className="border-amber/40 bg-ink-850 text-amber w-full max-w-lg rounded-[24px] border px-5 py-6 text-left font-mono text-xs leading-relaxed">
        {`┌──────────────────────────────┐
│ SPECIMEN NOT FOUND │
│ │
│ The requested research does │
│ not exist in this archive. │
│ │
│ Error ID: FRI-ERR-404 │
│ │
│ ERROR 404: │
│ COMMON SENSE NOT FOUND. │
└──────────────────────────────┘`}
      </pre>

      <p className="text-steel mt-8 max-w-md text-base leading-relaxed">
        Either this page was never written, or it was reclassified. The institute&apos;s records are
        not always in agreement with the institute.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="border-crt/45 bg-crt/10 text-2xs text-crt hover:bg-crt/20 border px-4 py-2.5 font-medium tracking-[0.08em] uppercase transition-colors"
        >
          Return to reception
        </Link>
        <Link
          href="/experiments"
          className="border-line text-2xs text-steel hover:border-line-bright hover:text-bone border px-4 py-2.5 font-medium tracking-[0.08em] uppercase transition-colors"
        >
          Browse experiments
        </Link>
      </div>
    </div>
  );
}
