"use client";

import { useMemo, useState } from "react";
import { MechanicalSwitch } from "@/components/ui/mechanical-switch";
import { cn } from "@/lib/cn";
import { ControlGroup, Readout, Segmented, SimFrame, Slider } from "./sim-frame";
import { modelWaterfall, type Protocol } from "./net-model";

const PROTOCOL_NOTE: Record<Protocol, string> = {
  h1: "Six connections per origin, no multiplexing. The seventh request waits in line.",
  h2: "One connection, many streams. A single lost TCP segment stalls every stream on it.",
  h3: "QUIC streams recover independently, so loss costs one stream instead of all of them.",
};

export default function NetworkLabSim() {
  const [rttMs, setRtt] = useState(120);
  const [mbps, setMbps] = useState(15);
  const [lossPercent, setLoss] = useState(0);
  const [protocol, setProtocol] = useState<Protocol>("h1");
  const [assets, setAssets] = useState(18);
  const [cdn, setCdn] = useState(false);

  const { bars, totalMs } = useMemo(
    () => modelWaterfall({ rttMs, mbps, lossPercent, protocol, assets, assetKb: 28, cdn }),
    [rttMs, mbps, lossPercent, protocol, assets, cdn],
  );

  const stalled = bars.filter((b) => b.stalled).length;

  return (
    <SimFrame
      code="BENCH-06A"
      title="Network simulator"
      status={`${protocol.toUpperCase()} · ${Math.round(totalMs)}MS`}
      controls={
        <>
          <ControlGroup label="Link">
            <Slider
              label="latency"
              value={rttMs}
              min={10}
              max={400}
              step={5}
              unit="ms"
              onChange={setRtt}
            />
            <Slider
              label="bandwidth"
              value={mbps}
              min={1}
              max={200}
              step={1}
              unit="Mbps"
              onChange={setMbps}
            />
            <Slider
              label="packet loss"
              value={lossPercent}
              min={0}
              max={8}
              step={0.5}
              unit="%"
              onChange={setLoss}
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
            <MechanicalSwitch
              label="edge / CDN"
              hint="Terminates TLS near the user"
              checked={cdn}
              onChange={setCdn}
            />
          </ControlGroup>
          <ControlGroup label="Page">
            <Slider label="assets" value={assets} min={4} max={48} onChange={setAssets} />
          </ControlGroup>
        </>
      }
      readout={
        <Readout
          rows={[
            ["Total", `${Math.round(totalMs)}ms`],
            ["Effective RTT", `${cdn ? Math.max(12, Math.round(rttMs * 0.25)) : rttMs}ms`],
            ["Parallel streams", protocol === "h1" ? "6" : String(assets)],
            [
              "Stalled by loss",
              stalled === 0 ? "none" : `${stalled} request${stalled === 1 ? "" : "s"}`,
            ],
          ]}
        />
      }
      note="Educational model: no congestion control, no slow start, no jitter. Reality is worse, never better."
    >
      <div className="p-4">
        <div className="space-y-1">
          {bars.map((bar) => (
            <div key={bar.index} className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-2">
              <span className="text-2xs text-steel-dim font-mono tabular-nums">
                #{String(bar.index + 1).padStart(2, "0")}
              </span>
              <div className="bg-ink-900/60 relative h-2.5">
                <div
                  className={cn(
                    "absolute top-0 h-full",
                    bar.stalled ? "bg-rust/70" : protocol === "h3" ? "bg-crt/60" : "bg-amber/55",
                  )}
                  style={{
                    left: `${(bar.startMs / Math.max(totalMs, 1)) * 100}%`,
                    width: `${Math.max((bar.durationMs / Math.max(totalMs, 1)) * 100, 0.8)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="border-line mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2">
          <p className="text-steel text-sm leading-relaxed">{PROTOCOL_NOTE[protocol]}</p>
          <pre className="border-line bg-ink-900 text-2xs text-steel border px-3 py-2 font-mono leading-relaxed">
            {`USER
 ↓ ${cdn ? "edge PoP" : "origin"} · ${cdn ? Math.max(12, Math.round(rttMs * 0.25)) : rttMs}ms
DNS → ${protocol === "h3" ? "QUIC" : "TCP → TLS"}
 ↓
SERVER
 ↓
RESPONSE → BROWSER`}
          </pre>
        </div>
      </div>
    </SimFrame>
  );
}
