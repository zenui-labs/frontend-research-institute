"use client";

import { useState } from "react";
import { MechanicalSwitch } from "@/components/ui/mechanical-switch";
import { cn } from "@/lib/cn";
import { observe } from "@/lib/observation-log";
import { ControlGroup, Readout, Segmented, SimFrame } from "./sim-frame";

type Target = "same-origin" | "same-site-subdomain" | "other-scheme" | "other-port" | "cross-site";

const TARGETS: { value: Target; label: string; url: string; note: string }[] = [
  {
    value: "same-origin",
    label: "Same origin",
    url: "https://app.example.com/api",
    note: "scheme, host and port all match",
  },
  {
    value: "same-site-subdomain",
    label: "Subdomain",
    url: "https://api.example.com/data",
    note: "same site, different origin",
  },
  {
    value: "other-scheme",
    label: "http://",
    url: "http://app.example.com/api",
    note: "scheme differs, so the origin differs",
  },
  {
    value: "other-port",
    label: "Other port",
    url: "https://app.example.com:8443/api",
    note: "port is part of the origin",
  },
  {
    value: "cross-site",
    label: "Cross site",
    url: "https://partner.test/api",
    note: "different registrable domain",
  },
];

type Row = {
  id: string;
  operation: string;
  allowed: (state: State) => boolean;
  reason: (state: State) => string;
};

type State = {
  target: Target;
  cors: boolean;
  credentials: boolean;
  sameSiteLax: boolean;
};

const sameOrigin = (s: State) => s.target === "same-origin";

const ROWS: Row[] = [
  {
    id: "send",
    operation: "Send the request",
    allowed: () => true,
    reason: () =>
      "The browser always sends it. The same-origin policy governs what you may read, not what you may send.",
  },
  {
    id: "read",
    operation: "Read the response body",
    allowed: (s) => sameOrigin(s) || s.cors,
    reason: (s) =>
      sameOrigin(s)
        ? "Same origin, so the response is readable."
        : s.cors
          ? "Access-Control-Allow-Origin matches, so the browser exposes the body."
          : "No matching CORS header. The request completed; your code is denied the body.",
  },
  {
    id: "cookies",
    operation: "Attach cookies",
    allowed: (s) =>
      sameOrigin(s) ||
      (s.credentials && !s.sameSiteLax) ||
      (s.credentials && s.target === "same-site-subdomain"),
    reason: (s) =>
      sameOrigin(s)
        ? "First-party request, so cookies are attached."
        : !s.credentials
          ? "credentials: 'omit' is the default for cross-origin fetch."
          : s.sameSiteLax && s.target === "cross-site"
            ? "SameSite=Lax withholds the cookie on cross-site subresource requests."
            : "Credentials requested and SameSite permits it.",
  },
  {
    id: "dom",
    operation: "Read the frame's DOM",
    allowed: (s) => sameOrigin(s),
    reason: (s) =>
      sameOrigin(s)
        ? "Scripting across the boundary is permitted."
        : "Blocked. Use postMessage, which crosses the boundary by agreement rather than by access.",
  },
  {
    id: "storage",
    operation: "Read localStorage",
    allowed: (s) => sameOrigin(s),
    reason: () => "Storage is partitioned by origin, with no header that can open it up.",
  },
];

export default function SameOriginSim() {
  const [state, setState] = useState<State>({
    target: "cross-site",
    cors: false,
    credentials: false,
    sameSiteLax: true,
  });

  const target = TARGETS.find((t) => t.value === state.target) ?? TARGETS[0];
  const allowedCount = ROWS.filter((row) => row.allowed(state)).length;

  function update(next: Partial<State>, message: string) {
    setState((prev) => ({ ...prev, ...next }));
    observe("USER ACTION", message);
    observe("BROWSER MODEL", "same-origin check re-evaluated");
  }

  return (
    <SimFrame
      code="BENCH-07A"
      title="Origin boundary"
      status={sameOrigin(state) ? "SAME ORIGIN" : "CROSS ORIGIN"}
      controls={
        <>
          <ControlGroup label="Request target">
            <Segmented
              value={state.target}
              columns={1}
              onChange={(value) => update({ target: value }, `target set to ${value}`)}
              options={TARGETS.map((t) => ({ value: t.value, label: t.label }))}
            />
          </ControlGroup>
          <ControlGroup label="Server and request">
            <MechanicalSwitch
              label="Access-Control-Allow-Origin"
              hint="Server opts the caller in"
              checked={state.cors}
              onChange={(next) =>
                update({ cors: next }, `CORS header ${next ? "sent" : "removed"}`)
              }
            />
            <MechanicalSwitch
              label="credentials: 'include'"
              tone="amber"
              checked={state.credentials}
              onChange={(next) =>
                update({ credentials: next }, `credentials ${next ? "included" : "omitted"}`)
              }
            />
            <MechanicalSwitch
              label="Cookie is SameSite=Lax"
              tone="amber"
              checked={state.sameSiteLax}
              onChange={(next) =>
                update({ sameSiteLax: next }, `SameSite=${next ? "Lax" : "None"}`)
              }
            />
          </ControlGroup>
        </>
      }
      readout={
        <Readout
          rows={[
            ["Origin", "https://app.example.com"],
            ["Target", target.url],
            ["Relationship", target.note],
            ["Permitted operations", `${allowedCount} of ${ROWS.length}`],
          ]}
        />
      }
      note="The policy is about reading, not requesting. A blocked fetch usually reached the server."
    >
      <div className="p-5">
        <ul className="space-y-2">
          {ROWS.map((row) => {
            const allowed = row.allowed(state);
            return (
              <li
                key={row.id}
                className={cn(
                  "rounded-[14px] px-4 py-3 transition-colors",
                  allowed ? "bg-sage/60" : "bg-ink-800",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-bone text-sm font-medium">{row.operation}</span>
                  <span
                    className={cn(
                      "text-2xs shrink-0 tracking-[0.1em] uppercase",
                      allowed ? "text-crt" : "text-rust",
                    )}
                  >
                    {allowed ? "allowed" : "blocked"}
                  </span>
                </div>
                <p className="text-steel mt-1.5 text-sm leading-relaxed">{row.reason(state)}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </SimFrame>
  );
}
