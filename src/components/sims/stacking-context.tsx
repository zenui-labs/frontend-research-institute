"use client";

import { useState } from "react";
import { MechanicalSwitch } from "@/components/ui/mechanical-switch";
import { observe } from "@/lib/observation-log";
import { ControlGroup, Readout, SimFrame, Slider, Stage } from "./sim-frame";

type Trigger = "opacity" | "transform" | "filter" | "willChange" | "isolation" | "contain";

const TRIGGERS: { id: Trigger; label: string; css: string; reason: string }[] = [
  {
    id: "opacity",
    label: "opacity: 0.99",
    css: "opacity",
    reason: "opacity < 1 needs the subtree flattened into one group",
  },
  {
    id: "transform",
    label: "transform: translateZ(0)",
    css: "transform",
    reason: "a transform makes the element a containing block and a composited group",
  },
  {
    id: "filter",
    label: "filter: blur(0px)",
    css: "filter",
    reason: "a filter operates on the rendered group, so the group must exist",
  },
  {
    id: "willChange",
    label: "will-change: transform",
    css: "will-change",
    reason: "the hint promotes the element eagerly, creating the context up front",
  },
  {
    id: "isolation",
    label: "isolation: isolate",
    css: "isolation",
    reason: "creating a stacking context is the entire purpose of this property",
  },
  {
    id: "contain",
    label: "contain: paint",
    css: "contain",
    reason: "paint containment guarantees nothing escapes the box, which implies a context",
  },
];

export default function StackingContextSim() {
  const [active, setActive] = useState<Record<Trigger, boolean>>({
    opacity: false,
    transform: false,
    filter: false,
    willChange: false,
    isolation: false,
    contain: false,
  });
  const [wrapperZ, setWrapperZ] = useState(0);

  const fired = TRIGGERS.filter((t) => active[t.id]);
  const hasContext = fired.length > 0 || wrapperZ > 0;
  const aOnTop = !hasContext || wrapperZ > 2;

  const wrapperStyle: React.CSSProperties = {
    position: "relative",
    ...(wrapperZ > 0 ? { zIndex: wrapperZ } : null),
    ...(active.opacity ? { opacity: 0.99 } : null),
    ...(active.transform ? { transform: "translateZ(0)" } : null),
    ...(active.filter ? { filter: "blur(0px)" } : null),
    ...(active.willChange ? { willChange: "transform" } : null),
    ...(active.isolation ? { isolation: "isolate" } : null),
    ...(active.contain ? { contain: "paint" } : null),
  };

  return (
    <SimFrame
      code="BENCH-02A"
      title="Stacking context"
      status={hasContext ? "CONTEXT ACTIVE" : "FLAT"}
      controls={
        <>
          <ControlGroup label="Wrapper declarations">
            {TRIGGERS.map((trigger) => (
              <MechanicalSwitch
                key={trigger.id}
                label={trigger.label}
                checked={active[trigger.id]}
                tone={active[trigger.id] ? "amber" : "crt"}
                onChange={(next) => {
                  setActive((prev) => ({ ...prev, [trigger.id]: next }));
                  observe("USER ACTION", `${trigger.label} ${next ? "enabled" : "removed"}`);
                  observe(
                    "BROWSER MODEL",
                    next
                      ? `stacking context created on .wrapper, ${trigger.reason}`
                      : "stacking context on .wrapper released",
                  );
                  observe(
                    "RESULT",
                    next
                      ? "panel B (z-index: 2) now paints above panel A (999999)"
                      : "panel A (999999) paints above panel B (2)",
                  );
                }}
              />
            ))}
          </ControlGroup>
          <ControlGroup label="Wrapper z-index">
            <Slider
              label="z-index"
              value={wrapperZ}
              min={0}
              max={5}
              onChange={(next) => {
                setWrapperZ(next);
                observe("USER ACTION", `.wrapper z-index = ${next === 0 ? "auto" : next}`);
                if (next > 0)
                  observe(
                    "BROWSER MODEL",
                    "positioned element with an explicit z-index, context created",
                  );
              }}
            />
          </ControlGroup>
        </>
      }
      readout={
        <Readout
          rows={[
            [
              "Stacking context on wrapper",
              hasContext ? (
                <span className="text-amber">YES</span>
              ) : (
                <span className="text-crt">NO</span>
              ),
            ],
            [
              "Painted on top",
              aOnTop ? (
                <span className="text-crt">PANEL A (999999)</span>
              ) : (
                <span className="text-rust">PANEL B (2)</span>
              ),
            ],
            ["Wrapper computed z-index", wrapperZ > 0 ? wrapperZ : "auto"],
            [
              "Cause",
              hasContext
                ? (fired[0]?.reason ?? "an explicit z-index on a positioned element")
                : "none. A and B are compared directly",
            ],
          ]}
        />
      }
    >
      <Stage>
        <div className="relative mx-auto h-[220px] w-full max-w-[420px]">
          <div style={wrapperStyle} className="absolute inset-0">
            <div
              style={{ position: "absolute", zIndex: 999999, top: 16, left: 16 }}
              className="border-crt/50 bg-crt/15 flex h-[120px] w-[220px] flex-col justify-between border p-3 backdrop-blur-[1px]"
            >
              <span className="text-2xs text-crt font-medium tracking-[0.08em]">PANEL A</span>
              <span className="text-2xs text-crt/80 font-mono">z-index: 999999</span>
              <span className="text-2xs text-crt/50 font-medium tracking-[0.08em]">
                CHILD OF .WRAPPER
              </span>
            </div>
          </div>

          <div
            style={{ position: "absolute", zIndex: 2, top: 76, left: 120 }}
            className="border-rust/60 bg-rust/20 flex h-[120px] w-[220px] flex-col justify-between border p-3"
          >
            <span className="text-2xs text-rust font-medium tracking-[0.08em]">PANEL B</span>
            <span className="text-2xs text-rust/90 font-mono">z-index: 2</span>
            <span className="text-2xs text-rust/60 font-medium tracking-[0.08em]">
              SIBLING OF .WRAPPER
            </span>
          </div>
        </div>
      </Stage>
    </SimFrame>
  );
}
