"use client";

import { useMemo, useState } from "react";
import { MechanicalSwitch } from "@/components/ui/mechanical-switch";
import { cn } from "@/lib/cn";
import { ControlGroup, Readout, Segmented, SimFrame } from "./sim-frame";

type Element = "div" | "button" | "a" | "input";

const ROLE_OF: Record<Element, string> = {
  div: "generic",
  button: "button",
  a: "link",
  input: "textbox",
};

const NAME_FROM_CONTENT: Record<Element, boolean> = {
  div: false,
  button: true,
  a: true,
  input: false,
};

export default function A11yTreeSim() {
  const [element, setElement] = useState<Element>("div");
  const [text, setText] = useState("Save");
  const [ariaLabel, setAriaLabel] = useState(false);
  const [roleButton, setRoleButton] = useState(false);
  const [tabindex, setTabindex] = useState(false);
  const [ariaHidden, setAriaHidden] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [labelled, setLabelled] = useState(false);

  const computed = useMemo(() => {
    const role = roleButton && element === "div" ? "button" : ROLE_OF[element];
    const name = ariaLabel
      ? "Save document"
      : labelled && element === "input"
        ? "Document title"
        : NAME_FROM_CONTENT[element] || (roleButton && element === "div")
          ? text || "(empty)"
          : "(no accessible name)";
    const focusable = !ariaHidden && !disabled && (element !== "div" ? true : tabindex);
    const keyboardActivates = !ariaHidden && !disabled && (element === "button" || element === "a");
    return { role, name, focusable, keyboardActivates };
  }, [element, text, ariaLabel, roleButton, tabindex, ariaHidden, disabled, labelled]);

  const markup = [
    `<${element}`,
    roleButton && element === "div" ? ` role="button"` : "",
    tabindex && element === "div" ? ` tabindex="0"` : "",
    ariaLabel ? ` aria-label="Save document"` : "",
    ariaHidden ? ` aria-hidden="true"` : "",
    disabled && element !== "div" && element !== "a" ? " disabled" : "",
    element === "a" ? ' href="/save"' : "",
    element === "input" ? ` value="${text}" />` : `>${text}</${element}>`,
  ].join("");

  const problems: string[] = [];
  if (ariaHidden)
    problems.push("aria-hidden removes the node from the accessibility tree entirely.");
  if (element === "div" && !tabindex)
    problems.push("Not reachable by keyboard: a div has no tab stop.");
  if (element === "div" && roleButton && !tabindex)
    problems.push('role="button" changes the announcement but adds no behaviour.');
  if (element === "div" && tabindex)
    problems.push("Focusable, but Enter and Space still do nothing without a keydown handler.");
  if (computed.name === "(no accessible name)")
    problems.push(
      "No accessible name: voice control cannot address it and screen readers announce only the role.",
    );
  if (element === "input" && !labelled && !ariaLabel)
    problems.push("An input with no associated <label> is announced as an unnamed text field.");

  return (
    <SimFrame
      code="BENCH-08A"
      title="The invisible DOM"
      status={
        problems.length === 0
          ? "EXPOSED CORRECTLY"
          : `${problems.length} ISSUE${problems.length === 1 ? "" : "S"}`
      }
      controls={
        <>
          <ControlGroup label="Element">
            <Segmented
              value={element}
              columns={2}
              onChange={setElement}
              options={[
                { value: "div", label: "div" },
                { value: "button", label: "button" },
                { value: "a", label: "a" },
                { value: "input", label: "input" },
              ]}
            />
            <label className="block">
              <span className="text-2xs text-steel mb-1.5 block font-medium tracking-[0.08em] uppercase">
                content
              </span>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="border-line bg-ink-900 text-bone w-full border px-2 py-1.5 font-mono text-xs"
              />
            </label>
          </ControlGroup>
          <ControlGroup label="Attributes">
            {element === "div" ? (
              <>
                <MechanicalSwitch
                  label='role="button"'
                  checked={roleButton}
                  onChange={setRoleButton}
                />
                <MechanicalSwitch label='tabindex="0"' checked={tabindex} onChange={setTabindex} />
              </>
            ) : null}
            {element === "input" ? (
              <MechanicalSwitch
                label="associated <label>"
                checked={labelled}
                onChange={setLabelled}
              />
            ) : null}
            <MechanicalSwitch label="aria-label" checked={ariaLabel} onChange={setAriaLabel} />
            <MechanicalSwitch
              label="disabled"
              tone="amber"
              checked={disabled}
              onChange={setDisabled}
            />
            <MechanicalSwitch
              label="aria-hidden"
              tone="rust"
              checked={ariaHidden}
              onChange={setAriaHidden}
            />
          </ControlGroup>
        </>
      }
      readout={
        <Readout
          rows={[
            ["Computed role", ariaHidden ? " (pruned)" : computed.role],
            ["Accessible name", ariaHidden ? "" : computed.name],
            [
              "Keyboard focusable",
              computed.focusable ? (
                <span className="text-crt" key="f">
                  yes
                </span>
              ) : (
                <span className="text-rust" key="f">
                  no
                </span>
              ),
            ],
            ["Enter / Space activates", computed.keyboardActivates ? "yes" : "no"],
          ]}
        />
      }
      note="Name computation order: aria-labelledby → aria-label → native markup or content → title."
    >
      <div className="bg-line grid gap-px md:grid-cols-2">
        <div className="bg-ink-850 p-4">
          <p className="label-tech mb-3">DOM tree</p>
          <pre className="border-line bg-ink-900 text-paper/85 overflow-x-auto border px-3 py-3 font-mono text-xs">
            {markup}
          </pre>
          <p className="label-tech mt-4 mb-2">Rendered</p>
          <div className="border-line bg-ink-900 border p-4">
            <span className="border-crt/40 bg-crt/10 text-crt inline-flex items-center border px-3 py-1.5 font-mono text-xs">
              {text || " "}
            </span>
          </div>
        </div>

        <div className="bg-ink-850 p-4">
          <p className="label-tech mb-3">Accessibility tree</p>
          {ariaHidden ? (
            <p className="border-rust/40 bg-rust/10 text-rust border px-3 py-3 font-mono text-xs">
              (node pruned, aria-hidden=&quot;true&quot;)
            </p>
          ) : (
            <ul className="border-line bg-ink-900 space-y-1 border px-3 py-3 font-mono text-xs">
              <li className="text-steel-dim">document</li>
              <li className="text-steel-dim ml-3">└─ group</li>
              <li
                className={cn("ml-6", computed.role === "generic" ? "text-steel-dim" : "text-crt")}
              >
                └─ {computed.role}
                {computed.name !== "(no accessible name)" ? ` “${computed.name}”` : ""}
              </li>
              <li className="text-steel-dim ml-12">
                focusable: {computed.focusable ? "true" : "false"}
                {disabled ? " · disabled: true" : ""}
              </li>
            </ul>
          )}

          {problems.length ? (
            <ul className="mt-4 space-y-2">
              {problems.map((problem) => (
                <li key={problem} className="text-amber/90 flex gap-2 text-xs leading-snug">
                  <span aria-hidden>▲</span>
                  <span>{problem}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-crt mt-4 text-xs">
              Role, name, focus and keyboard behaviour are all present, with no ARIA required.
            </p>
          )}
        </div>
      </div>
    </SimFrame>
  );
}
