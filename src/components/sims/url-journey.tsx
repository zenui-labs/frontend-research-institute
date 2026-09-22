"use client";

import { useMemo, useState } from "react";
import { MechanicalSwitch } from "@/components/ui/mechanical-switch";
import { cn } from "@/lib/cn";
import { ControlGroup, Readout, Segmented, SimFrame, Slider } from "./sim-frame";
import { modelJourney, type Protocol } from "./net-model";

const TONE = {
  steel: "bg-steel/45 text-steel",
  amber: "bg-amber/60 text-amber",
  crt: "bg-crt/55 text-crt",
  rust: "bg-rust/60 text-rust",
};

export default function UrlJourneySim() {
  const [rttMs, setRtt] = useState(150);
  const [protocol, setProtocol] = useState<Protocol>("h1");
  const [warmConnection, setWarm] = useState(false);
  const [dnsCached, setDns] = useState(false);
  const [serverThinkMs, setThink] = useState(120);
  const [mbps, setMbps] = useState(20);

  const phases = useMemo(
    () =>
      modelJourney({
        rttMs,
        protocol,
        warmConnection,
        dnsCached,
        serverThinkMs,
        htmlKb: 42,
        cssKb: 38,
        jsKb: 280,
        mbps,
      }),
    [rttMs, protocol, warmConnection, dnsCached, serverThinkMs, mbps],
  );

  const total = phases.reduce((sum, p) => sum + p.ms, 0);
  const firstPaintIndex = phases.findIndex((p) => p.id === "paint");
  const timeToPaint = phases.slice(0, firstPaintIndex + 1).reduce((sum, p) => sum + p.ms, 0);
  const handshake = phases
    .filter((p) => ["dns", "tcp", "tls", "quic"].includes(p.id))
    .reduce((sum, p) => sum + p.ms, 0);

  const offsets = phases.reduce<number[]>((acc, phase, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + phases[i - 1].ms);
    return acc;
  }, []);

  return (
    <SimFrame
      code="BENCH-01B"
      title="Request journey"
      status={timeToPaint > 3000 ? "POOR" : timeToPaint > 1800 ? "SLOW" : "ACCEPTABLE"}
      controls={
        <>
          <ControlGroup label="Distance">
            <Slider
              label="round trip"
              value={rttMs}
              min={10}
              max={320}
              step={5}
              unit="ms"
              onChange={setRtt}
            />
            <Slider
              label="bandwidth"
              value={mbps}
              min={2}
              max={200}
              step={2}
              unit="Mbps"
              onChange={setMbps}
            />
            <Slider
              label="server time"
              value={serverThinkMs}
              min={5}
              max={600}
              step={5}
              unit="ms"
              onChange={setThink}
            />
          </ControlGroup>
          <ControlGroup label="Protocol">
            <Segmented
              value={protocol}
              columns={3}
              onChange={setProtocol}
              options={[
                { value: "h1", label: "H1.1" },
                { value: "h2", label: "H2" },
                { value: "h3", label: "H3" },
              ]}
            />
          </ControlGroup>
          <ControlGroup label="Cache state">
            <MechanicalSwitch label="DNS cached" checked={dnsCached} onChange={setDns} />
            <MechanicalSwitch
              label="connection reused"
              checked={warmConnection}
              onChange={setWarm}
            />
          </ControlGroup>
        </>
      }
      readout={
        <Readout
          rows={[
            ["Handshake overhead", `${handshake}ms`],
            [
              "Time to first paint",
              <span key="p" className={timeToPaint > 2500 ? "text-rust" : "text-crt"}>
                {timeToPaint}ms
              </span>,
            ],
            ["Interactive (modelled)", `${total}ms`],
            ["Spent on distance", `${Math.round((handshake / Math.max(total, 1)) * 100)}%`],
          ]}
        />
      }
      note="Educational model. Real loads include slow start, congestion control, jitter and retries."
    >
      <div className="space-y-2 p-4">
        {phases.map((phase, i) => {
          const left = (offsets[i] / Math.max(total, 1)) * 100;
          const width = (phase.ms / Math.max(total, 1)) * 100;
          return (
            <div
              key={phase.id}
              className="grid grid-cols-[130px_minmax(0,1fr)_58px] items-center gap-3"
            >
              <span className="text-2xs text-steel truncate font-medium tracking-[0.08em] uppercase">
                {phase.label}
              </span>
              <div className="border-line bg-ink-900/60 relative h-5 border">
                <div
                  className={cn("absolute top-0 h-full", TONE[phase.tone].split(" ")[0])}
                  style={{ left: `${left}%`, width: `${Math.max(width, 0.6)}%` }}
                  title={phase.detail}
                />
              </div>
              <span className="text-2xs text-bone text-right font-mono tabular-nums">
                {phase.ms}ms
              </span>
            </div>
          );
        })}

        <ul className="border-line mt-4 space-y-1.5 border-t pt-3">
          {phases.map((phase) => (
            <li key={phase.id} className="text-steel-dim flex gap-2 text-xs leading-snug">
              <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0", TONE[phase.tone].split(" ")[0])} />
              <span>
                <span className="text-steel">{phase.label}:</span> {phase.detail}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </SimFrame>
  );
}
