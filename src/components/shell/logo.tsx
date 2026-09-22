import { cn } from "@/lib/cn";

/**
 * Institute seal: an aperture ring with a specimen dot off-centre, the
 * observation the whole place is organised around.
 */
export function InstituteMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={cn("h-10 w-10", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="9.25"
        className="fill-ink-800 stroke-line-bright"
        strokeWidth="1.5"
      />
      <circle
        cx="16"
        cy="16"
        r="8.5"
        className="stroke-crt"
        strokeWidth="1.5"
        strokeOpacity="0.55"
      />
      <path
        d="M16 7.5a8.5 8.5 0 0 1 8.5 8.5"
        className="stroke-crt"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="20.4" cy="11.6" r="2.1" className="fill-crt" />
      <path d="M11 20.5h10" className="stroke-steel-dim" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("leading-[1.05]", className)}>
      <span className="font-display text-bone block text-sm font-semibold tracking-[-0.01em]">
        Frontend Research
      </span>
      <span className="text-2xs text-steel-dim block font-medium tracking-[0.18em] uppercase">
        Institute
      </span>
    </span>
  );
}

/** Brand icons were dropped from the icon set, so the mark lives here. */
export function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={cn("h-4 w-4", className)} fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
