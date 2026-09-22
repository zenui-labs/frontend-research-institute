"use client";

import { useState } from "react";
import { ControlGroup, Readout, Segmented, SimFrame, Slider, Stage } from "./sim-frame";

export default function BoxOverflowSim() {
  const [parentWidth, setParentWidth] = useState(320);
  const [childPercent, setChildPercent] = useState(100);
  const [padding, setPadding] = useState(16);
  const [border, setBorder] = useState(1);
  const [margin, setMargin] = useState(0);
  const [sizing, setSizing] = useState<"content-box" | "border-box">("content-box");

  const declaredWidth = (parentWidth * childPercent) / 100;
  const usedBorderBox =
    sizing === "content-box" ? declaredWidth + padding * 2 + border * 2 : declaredWidth;
  const occupied = usedBorderBox + margin * 2;
  const overflow = Math.max(0, Math.round(occupied - parentWidth));
  const contentWidth =
    sizing === "content-box"
      ? declaredWidth
      : Math.max(0, declaredWidth - padding * 2 - border * 2);

  return (
    <SimFrame
      code="BENCH-02C"
      title="Box model"
      status={overflow > 0 ? "OVERFLOWING" : "CONTAINED"}
      controls={
        <>
          <ControlGroup label="Containing block">
            <Slider
              label="parent width"
              value={parentWidth}
              min={160}
              max={480}
              unit="px"
              onChange={setParentWidth}
            />
          </ControlGroup>
          <ControlGroup label="Child box">
            <Slider
              label="width"
              value={childPercent}
              min={20}
              max={110}
              unit="%"
              onChange={setChildPercent}
            />
            <Slider
              label="padding"
              value={padding}
              min={0}
              max={48}
              unit="px"
              onChange={setPadding}
            />
            <Slider label="border" value={border} min={0} max={12} unit="px" onChange={setBorder} />
            <Slider label="margin" value={margin} min={0} max={32} unit="px" onChange={setMargin} />
            <Segmented
              label="box-sizing"
              value={sizing}
              onChange={setSizing}
              options={[
                { value: "content-box", label: "content" },
                { value: "border-box", label: "border" },
              ]}
            />
          </ControlGroup>
        </>
      }
      readout={
        <Readout
          rows={[
            ["Declared width", `${Math.round(declaredWidth)}px`],
            ["Content box", `${Math.round(contentWidth)}px`],
            ["Border box", `${Math.round(usedBorderBox)}px`],
            ["Space occupied (+ margins)", `${Math.round(occupied)}px`],
            ["Parent content box", `${parentWidth}px`],
            [
              "Overflow",
              overflow > 0 ? (
                <span className="text-rust">{overflow}px</span>
              ) : (
                <span className="text-crt">none</span>
              ),
            ],
          ]}
        />
      }
      note={
        overflow > 0
          ? "The child is wider than the space it was given. Nothing is broken; the arithmetic is simply being honest."
          : "Everything fits. Change box-sizing and watch which number moves."
      }
    >
      <Stage className="flex items-center justify-center">
        <div className="w-full max-w-full overflow-x-auto py-4">
          <div
            className="border-steel/40 bg-ink-800/60 relative mx-auto border border-dashed"
            style={{ width: parentWidth, minHeight: 150 }}
          >
            <span className="text-2xs text-steel-dim absolute -top-5 left-0 font-medium tracking-[0.08em]">
              PARENT · {parentWidth}px
            </span>

            <div style={{ margin, boxSizing: "content-box" }} className="relative">
              <div
                style={{
                  width: sizing === "content-box" ? declaredWidth : declaredWidth,
                  boxSizing: sizing,
                  padding,
                  borderWidth: border,
                }}
                className="border-amber/70 bg-amber/10 relative border-solid"
              >
                <div className="bg-crt/15 outline-crt/40 h-[70px] outline outline-dashed">
                  <span className="text-2xs text-crt/80 block p-2 font-medium tracking-[0.08em]">
                    CONTENT · {Math.round(contentWidth)}px
                  </span>
                </div>
              </div>
            </div>

            {overflow > 0 ? (
              <span
                aria-hidden
                className="border-rust absolute top-0 right-0 h-full border-r-2"
                style={{ marginRight: -1 }}
              />
            ) : null}
          </div>
        </div>
      </Stage>
    </SimFrame>
  );
}
