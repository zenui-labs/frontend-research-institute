import { cn } from "@/lib/cn";
import { RichText } from "./rich-text";

type Variant = "note" | "warning" | "fact" | "model" | "myth" | "joke";

/** Labelled research blocks. A rule and a label, not a tinted card. */
const STYLES: Record<Variant, { label: string; rule: string; label_color: string }> = {
  note: { label: "Technical note", rule: "border-line-bright", label_color: "text-steel" },
  warning: { label: "Common misconception", rule: "border-amber/60", label_color: "text-amber" },
  fact: { label: "Documented fact", rule: "border-crt/60", label_color: "text-crt" },
  model: { label: "Simplified model", rule: "border-steel-dim/60", label_color: "text-steel-dim" },
  myth: { label: "Under dispute", rule: "border-rust/60", label_color: "text-rust" },
  joke: { label: "Institute note", rule: "border-line", label_color: "text-steel-dim" },
};

export function Callout({
  variant,
  title,
  text,
}: {
  variant: Variant;
  title?: string;
  text: string;
}) {
  const style = STYLES[variant];

  return (
    <aside className={cn("border-l-2 py-1 pl-5", style.rule)}>
      <p className={cn("text-2xs font-medium tracking-[0.14em] uppercase", style.label_color)}>
        {title ?? style.label}
      </p>
      <p
        className={cn(
          "text-steel mt-2 text-base leading-relaxed",
          variant === "joke" && "text-steel-dim text-sm",
        )}
      >
        <RichText text={text} />
      </p>
    </aside>
  );
}

/** Numbered observation / finding, used by experiment documents. */
export function ResearchNote({
  kind,
  number,
  children,
}: {
  kind: "Observation" | "Finding" | "Hypothesis";
  number?: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="border-crt/60 border-l-2 py-1 pl-5">
      <p className="text-2xs text-crt font-medium tracking-[0.14em] uppercase">
        {kind}
        {number ? ` ${number}` : ""}
      </p>
      <div className="text-steel mt-2 text-base leading-relaxed">{children}</div>
    </aside>
  );
}
