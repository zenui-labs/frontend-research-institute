import type { Metadata } from "next";
import { MythCard } from "@/components/ui/cards";
import { SectionHeading } from "@/components/ui/panel";
import { MYTHS } from "@/content";

export const metadata: Metadata = {
  title: "Myth Archive",
  description:
    "Frontend myths investigated with evidence: !important, React is slow, more memoization, smaller bundles, Lighthouse 100, useEffect for everything, Tailwind and caching.",
  alternates: { canonical: "/myths" },
};

export default function MythsPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6">
      <SectionHeading title="Claims, examined" />

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MYTHS.map((myth) => (
          <li key={myth.id} className="flex">
            <MythCard myth={myth} />
          </li>
        ))}
      </ul>
    </div>
  );
}
