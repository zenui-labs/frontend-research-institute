import { DIFFICULTY_LEVEL, type Difficulty } from "@/content/types";
import { cn } from "@/lib/cn";

const CHIP =
  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-2xs font-medium tracking-[0.1em] uppercase";

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  CURIOUS: "bg-sage text-crt",
  DEVELOPER: "bg-sage text-crt",
  ENGINEER: "bg-butter text-amber",
  RESEARCHER: "bg-butter text-amber",
  SYSTEMS: "bg-peach text-rust",
  EXPERIMENTAL: "bg-peach text-rust",
};

export function DifficultyBadge({
  difficulty,
  showLevel = false,
  className,
}: {
  difficulty: Difficulty;
  showLevel?: boolean;
  className?: string;
}) {
  return (
    <span className={cn(CHIP, DIFFICULTY_STYLE[difficulty], className)}>
      {showLevel ? <span className="opacity-60">{DIFFICULTY_LEVEL[difficulty]}</span> : null}
      {difficulty}
    </span>
  );
}

export function StatusChip({ status, className }: { status: string; className?: string }) {
  const good = status === "OPERATIONAL" || status === "ACTIVE" || status === "CLOSED";
  const bad = status === "CLASSIFIED" || status === "BUSTED";

  return (
    <span
      className={cn(
        CHIP,
        good ? "bg-sage text-crt" : bad ? "bg-peach text-rust" : "bg-butter text-amber",
        className,
      )}
    >
      <span className="led inline-block h-[5px] w-[5px] rounded-full bg-current" />
      {status}
    </span>
  );
}

export function MetaTag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "bg-ink-700 text-2xs text-steel inline-flex items-center rounded-full px-2 py-0.5 font-medium tracking-[0.08em] uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
