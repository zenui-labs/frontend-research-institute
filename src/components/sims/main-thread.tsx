"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/reduced-motion";
import { observe } from "@/lib/observation-log";
import { RetroButton } from "@/components/ui/retro-button";
import { ControlGroup, Readout, SimFrame, Slider } from "./sim-frame";

type Strategy = "blocking" | "chunked" | "worker";

type Result = {
  strategy: Strategy;
  durationMs: number;
  frames: number;
  expectedFrames: number;
  longestGapMs: number;
};

const LABEL: Record<Strategy, string> = {
  blocking: "One synchronous task",
  chunked: "Chunked with yields",
  worker: "Web Worker",
};

const WORKER_SOURCE = `self.onmessage = (event) => {
 const end = performance.now() + event.data;
 let acc = 0;
 while (performance.now() < end) { acc += Math.sqrt(acc + 1); }
 self.postMessage(acc);
};`;

function burn(ms: number): number {
  const end = performance.now() + ms;
  let acc = 0;
  while (performance.now() < end) acc += Math.sqrt(acc + 1);
  return acc;
}

export default function MainThreadSim() {
  const reduced = useReducedMotion();
  const [workMs, setWorkMs] = useState(800);
  const [running, setRunning] = useState<Strategy | null>(null);
  const [results, setResults] = useState<Partial<Record<Strategy, Result>>>({});
  const frameTimes = useRef<number[]>([]);

  useEffect(() => {
    let id = 0;
    const loop = (t: number) => {
      frameTimes.current.push(t);
      if (frameTimes.current.length > 600) frameTimes.current.shift();
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  async function measure(strategy: Strategy, run: () => Promise<void> | void) {
    setRunning(strategy);
    observe("USER ACTION", `${LABEL[strategy].toLowerCase()}, ${workMs}ms of work`);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const start = performance.now();
    const marker = frameTimes.current.length;

    await run();

    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const durationMs = performance.now() - start;
    const observed = frameTimes.current.slice(marker);
    let longestGapMs = 0;
    for (let i = 1; i < observed.length; i += 1) {
      longestGapMs = Math.max(longestGapMs, observed[i] - observed[i - 1]);
    }
    observe(
      "MEASUREMENT",
      `${observed.length} frames rendered, longest gap ${Math.round(longestGapMs)}ms`,
    );
    setResults((prev) => ({
      ...prev,
      [strategy]: {
        strategy,
        durationMs,
        frames: observed.length,
        expectedFrames: Math.round(durationMs / 16.7),
        longestGapMs,
      },
    }));
    setRunning(null);
  }

  function runBlocking() {
    return measure("blocking", () => {
      burn(workMs);
    });
  }

  function runChunked() {
    return measure("chunked", async () => {
      const chunk = 8;
      const chunks = Math.ceil(workMs / chunk);
      for (let i = 0; i < chunks; i += 1) {
        burn(chunk);
        await new Promise((r) => setTimeout(r, 0));
      }
    });
  }

  function runWorker() {
    return measure("worker", async () => {
      const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" }));
      const worker = new Worker(url);
      await new Promise<void>((resolve) => {
        worker.onmessage = () => resolve();
        worker.postMessage(workMs);
      });
      worker.terminate();
      URL.revokeObjectURL(url);
    });
  }

  const rows = (["blocking", "chunked", "worker"] as const)
    .map((s) => results[s])
    .filter(Boolean) as Result[];

  return (
    <SimFrame
      code="BENCH-05B"
      title="Main-thread occupancy"
      status={running ? "RUNNING. WATCH THE BOXES" : "IDLE"}
      controls={
        <>
          <ControlGroup label="Workload">
            <Slider
              label="work"
              value={workMs}
              min={200}
              max={2500}
              step={100}
              unit="ms"
              onChange={setWorkMs}
            />
          </ControlGroup>
          <ControlGroup label="Strategy">
            <div className="space-y-2">
              <RetroButton
                size="sm"
                variant="danger"
                className="w-full"
                disabled={running !== null}
                onClick={runBlocking}
              >
                Block the thread
              </RetroButton>
              <RetroButton
                size="sm"
                className="w-full"
                disabled={running !== null}
                onClick={runChunked}
              >
                Chunk with yields
              </RetroButton>
              <RetroButton
                size="sm"
                variant="primary"
                className="w-full"
                disabled={running !== null}
                onClick={runWorker}
              >
                Move to a worker
              </RetroButton>
            </div>
          </ControlGroup>
        </>
      }
      readout={
        rows.length === 0 ? (
          <p className="text-steel-dim">
            No measurements yet. Run all three and compare, the numbers come from your device, right
            now.
          </p>
        ) : (
          <Readout
            rows={rows.map((r) => [
              LABEL[r.strategy],
              <span
                key={r.strategy}
                className={r.frames < r.expectedFrames * 0.5 ? "text-rust" : "text-crt"}
              >
                {r.frames}/{r.expectedFrames} frames · longest gap {Math.round(r.longestGapMs)}ms
              </span>,
            ])}
          />
        )
      }
    >
      <div className="space-y-4 p-4">
        <div className="space-y-3">
          <div>
            <p className="text-2xs text-crt mb-1.5 font-medium tracking-[0.08em] uppercase">
              transform, compositor thread
            </p>
            <div className="border-line bg-ink-900/60 relative h-8 overflow-hidden border">
              <div
                className={cn(
                  "bg-crt/70 absolute top-1.5 h-5 w-5",
                  !reduced && "animate-[shuttle_2.4s_ease-in-out_infinite]",
                )}
                style={{ left: 0 }}
              />
            </div>
          </div>
          <div>
            <p className="text-2xs text-rust mb-1.5 font-medium tracking-[0.08em] uppercase">
              left, main thread
            </p>
            <div className="border-line bg-ink-900/60 relative h-8 overflow-hidden border">
              <div
                className={cn(
                  "bg-rust/70 absolute top-1.5 h-5 w-5",
                  !reduced && "animate-[crawl_2.4s_ease-in-out_infinite]",
                )}
              />
            </div>
          </div>
        </div>

        <style>{`
 @keyframes shuttle {
 0%, 100% { transform: translateX(4px); }
 50% { transform: translateX(calc(100% + 100px)); }
 }
 @keyframes crawl {
 0%, 100% { left: 4px; }
 50% { left: calc(100% - 28px); }
 }
 `}</style>

        <p className="text-steel text-sm leading-relaxed">
          Both boxes travel the same distance. While the main thread is blocked, the green box keeps
          moving, its animation lives on the compositor, and the red box freezes, because animating{" "}
          <code className="text-crt/85 font-mono">left</code> needs layout on the thread you just
          occupied.
        </p>
      </div>
    </SimFrame>
  );
}
