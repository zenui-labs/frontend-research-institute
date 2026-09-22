import type { Metadata } from "next";
import { SimMount } from "@/components/sims/sim-mount";
import { SectionHeading } from "@/components/ui/panel";

export const metadata: Metadata = {
  title: "Observatory",
  description:
    "Standing instruments: the dependency observatory, the network simulator and the rendering pipeline monitor. Operate them without an experiment attached.",
  alternates: { canonical: "/observatory" },
};

const INSTRUMENTS = [
  {
    id: "dependency-graph" as const,
    code: "OBS-01",
    name: "Dependency Observatory",
    blurb:
      "Weigh a dependency graph honestly: transitive depth, duplicate majors, module format and what actually reaches the bundle.",
  },
  {
    id: "network-lab" as const,
    code: "OBS-02",
    name: "Network Observatory",
    blurb:
      "Latency, bandwidth, packet loss and protocol, adjustable independently, so you can see which one your page is actually bound by.",
  },
  {
    id: "render-pipeline" as const,
    code: "OBS-03",
    name: "Rendering Observatory",
    blurb:
      "Mutate a property and watch which pipeline stages are invalidated, on which thread, and at what cost per frame.",
  },
];

export default function ObservatoryPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6">
      <SectionHeading title="Standing instruments" />

      <div className="mt-10 space-y-16">
        {INSTRUMENTS.map((instrument) => (
          <section key={instrument.id}>
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-xl font-semibold">
                <span className="text-steel-dim mr-3">{instrument.code}</span>
                {instrument.name}
              </h2>
            </div>
            <p className="text-steel mb-5 max-w-2xl text-base leading-relaxed">
              {instrument.blurb}
            </p>
            <SimMount sim={instrument.id} />
          </section>
        ))}
      </div>

      <section className="border-rust/25 bg-rust/[0.04] mt-16 border px-6 py-6">
        <p className="font-display text-rust text-base font-semibold">
          Research division classified
        </p>
        <p className="text-steel-dim mt-3 max-w-2xl text-sm leading-relaxed">
          The Browser Observatory (real-device telemetry) and the Performance Observatory (field
          data ingestion) are not open to visitors. The institute is aware that this is exactly what
          it would say if they did not exist yet.
        </p>
      </section>
    </div>
  );
}
