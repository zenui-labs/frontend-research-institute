import type { Metadata } from "next";
import { CaseCard } from "@/components/ui/cards";
import { SectionHeading } from "@/components/ui/panel";
import { CASES } from "@/content";

export const metadata: Metadata = {
  title: "Frontend Detective",
  description:
    "Investigate real frontend bugs as case files: a missing button, a duplicate order, a phantom scrollbar. Pull the evidence, name a suspect, learn the mechanism.",
  alternates: { canonical: "/detective" },
};

export default function DetectivePage() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6">
      <SectionHeading title="Every interface has a crime scene" />
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CASES.map((item) => (
          <li key={item.id} className="flex">
            <CaseCard detectiveCase={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
