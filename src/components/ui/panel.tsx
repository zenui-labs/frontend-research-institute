import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Panel({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "aside";
}) {
  return <Tag className={cn("panel", className)}>{children}</Tag>;
}

export function PanelHeader({
  code,
  title,
  right,
  className,
}: {
  code?: string;
  title: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 px-4 py-3", className)}>
      <div className="flex min-w-0 items-center gap-3">
        {code ? <span className="label-tech shrink-0">{code}</span> : null}
        <span className="font-display text-bone truncate text-base font-semibold">{title}</span>
      </div>
      {right}
    </div>
  );
}

/**
 * Section markers carry the title and, at most, a sentence. No decorative
 * eyebrow, no rule underneath, spacing does that job.
 */
export function SectionHeading({
  title,
  description,
  right,
  className,
}: {
  title: string;
  description?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-8 gap-y-4", className)}>
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl leading-[1.1] font-semibold text-balance sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="text-steel mt-3 text-base leading-relaxed">{description}</p>
        ) : null}
      </div>
      {right}
    </div>
  );
}

export function HazardStrip({ label }: { label: string }) {
  return (
    <div
      className="bg-butter text-amber inline-flex items-center gap-2.5 rounded-full px-3 py-1.5"
      role="note"
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      <span className="text-2xs font-mono tracking-[0.08em] uppercase">{label}</span>
    </div>
  );
}
