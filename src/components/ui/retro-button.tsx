"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { play } from "@/lib/sound";

type Variant = "primary" | "ghost" | "danger";
type Size = "sm" | "md";

const BASE = [
  "group inline-flex select-none items-center justify-center gap-2 rounded-full",
  "font-medium tracking-[-0.005em] transition-[background-color,border-color,color,transform] duration-150",
  " disabled:pointer-events-none disabled:opacity-40",
].join(" ");

const SIZES: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
};

const VARIANTS: Record<Variant, string> = {
  primary: "bg-crt text-ink-950 hover:bg-[#7bf0b4]",
  ghost: "border border-line bg-ink-850 text-bone hover:border-line-bright hover:bg-ink-700",
  danger: "border border-rust/30 bg-rust/[0.08] text-rust hover:bg-rust/[0.14]",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function RetroButton({
  variant = "ghost",
  size = "md",
  className,
  children,
  onClick,
  ...rest
}: CommonProps & ComponentProps<"button">) {
  return (
    <button
      {...rest}
      className={cn(BASE, SIZES[size], VARIANTS[variant], className)}
      onClick={(event) => {
        play("click");
        onClick?.(event);
      }}
    >
      {children}
    </button>
  );
}

export function RetroLink({
  variant = "ghost",
  size = "md",
  className,
  children,
  href,
  ...rest
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link
      {...rest}
      href={href}
      className={cn(BASE, SIZES[size], VARIANTS[variant], className)}
      onClick={() => play("click")}
    >
      {children}
    </Link>
  );
}
