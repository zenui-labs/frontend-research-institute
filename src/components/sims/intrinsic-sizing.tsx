"use client";

import { useState } from "react";
import { MechanicalSwitch } from "@/components/ui/mechanical-switch";
import { ControlGroup, Readout, Segmented, SimFrame, Slider, Stage } from "./sim-frame";

type Keyword = "auto" | "min-content" | "max-content" | "fit-content" | "100%";

const SAMPLE = "Investigating unpredictable internationalisation";

const EXPLAIN: Record<Keyword, string> = {
  auto: "Block boxes fill the containing block; shrink-to-fit applies to floats, inline-blocks and absolutely positioned boxes.",
  "min-content":
    "The narrowest the box can be without its content overflowing, the longest unbreakable word.",
  "max-content":
    "The width the content would take on a single line, ignoring the available space entirely.",
  "fit-content":
    "clamp(min-content, available space, max-content). Shrink-to-fit, expressed as a keyword.",
  "100%":
    "A percentage of the containing block's content box, unrelated to the content inside the box.",
};

export default function IntrinsicSizingSim() {
  const [container, setContainer] = useState(360);
  const [keyword, setKeyword] = useState<Keyword>("auto");
  const [flexMode, setFlexMode] = useState(false);
  const [minWidthZero, setMinWidthZero] = useState(false);
  const [truncate, setTruncate] = useState(false);

  const boxStyle: React.CSSProperties = flexMode
    ? {
        flex: "1",
        minWidth: minWidthZero ? 0 : undefined,
        ...(truncate
          ? { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
          : null),
      }
    : { width: keyword };

  return (
    <SimFrame
      code="BENCH-02D"
      title="Intrinsic sizing"
      status={flexMode ? "FLEX ITEM" : "BLOCK"}
      controls={
        <>
          <ControlGroup label="Container">
            <Slider
              label="width"
              value={container}
              min={140}
              max={560}
              unit="px"
              onChange={setContainer}
            />
          </ControlGroup>
          <ControlGroup label="Mode">
            <MechanicalSwitch
              label="flex item"
              hint="Applies flex: 1 instead of a width keyword"
              checked={flexMode}
              onChange={setFlexMode}
            />
            {flexMode ? (
              <>
                <MechanicalSwitch
                  label="min-width: 0"
                  hint="Opt out of the automatic minimum size"
                  tone="amber"
                  checked={minWidthZero}
                  onChange={setMinWidthZero}
                />
                <MechanicalSwitch
                  label="truncate"
                  hint="overflow + text-overflow + nowrap"
                  tone="amber"
                  checked={truncate}
                  onChange={setTruncate}
                />
              </>
            ) : null}
          </ControlGroup>
          {!flexMode ? (
            <ControlGroup label="width">
              <Segmented
                value={keyword}
                onChange={setKeyword}
                columns={1}
                options={[
                  { value: "auto", label: "auto" },
                  { value: "min-content", label: "min-content" },
                  { value: "max-content", label: "max-content" },
                  { value: "fit-content", label: "fit-content" },
                  { value: "100%", label: "100%" },
                ]}
              />
            </ControlGroup>
          ) : null}
        </>
      }
      readout={
        <Readout
          rows={[
            ["Container", `${container}px`],
            [
              "Applied",
              flexMode ? `flex: 1${minWidthZero ? "; min-width: 0" : ""}` : `width: ${keyword}`,
            ],
            [
              "Behaviour",
              flexMode
                ? minWidthZero
                  ? "Can shrink below its longest word"
                  : "Floored at its min-content size"
                : EXPLAIN[keyword].split(".")[0],
            ],
          ]}
        />
      }
      note={
        flexMode && !minWidthZero
          ? "min-width: auto is the default on flex items. The box will not shrink below its min-content size."
          : EXPLAIN[keyword]
      }
    >
      <Stage className="flex items-center">
        <div className="w-full overflow-x-auto">
          <div
            className="border-steel/40 bg-ink-800/60 border border-dashed p-3"
            style={{ width: container, display: flexMode ? "flex" : "block", gap: 8 }}
          >
            <div
              style={boxStyle}
              className="border-crt/50 bg-crt/10 text-paper/90 border p-3 text-sm leading-relaxed"
            >
              {SAMPLE}
            </div>
            {flexMode ? (
              <div className="border-line bg-ink-700 text-2xs text-steel shrink-0 border p-3 font-mono">
                auto
              </div>
            ) : null}
          </div>
        </div>
      </Stage>
    </SimFrame>
  );
}
