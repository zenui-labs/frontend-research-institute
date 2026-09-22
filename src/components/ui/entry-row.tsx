import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Route } from "next";
import { cn } from "@/lib/cn";

/** A single line in a document list, the alternative to another card. */
export function EntryRow({
  href,
  title,
  summary,
  right,
  className,
}: {
  href: Route;
  title: string;
  summary?: string;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group hover:bg-ink-850 -mx-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-[14px] px-4 py-3.5 transition-colors",
        className,
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="font-display group-hover:text-crt block text-base font-semibold transition-colors">
          {title}
        </span>
        {summary ? (
          <span className="text-steel-dim mt-0.5 line-clamp-1 block text-sm">{summary}</span>
        ) : null}
      </span>
      <span className="flex shrink-0 items-center gap-3">
        {right}
        <ArrowUpRight size={14} aria-hidden className="text-steel-dim" />
      </span>
    </Link>
  );
}
