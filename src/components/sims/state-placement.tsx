"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { ControlGroup, Readout, Segmented, SimFrame } from "./sim-frame";
import { TreeView, subtreeIds, type NodeState, type TreeNode } from "./react-tree";

const TREE: TreeNode[] = [
  {
    id: "app",
    label: "<App>",
    children: [
      { id: "header", label: "<Header>" },
      {
        id: "page",
        label: "<Page>",
        children: [
          {
            id: "toolbar",
            label: "<Toolbar>",
            children: [
              { id: "search", label: "<SearchInput>, owns the query" },
              { id: "filters", label: "<Filters>" },
            ],
          },
          {
            id: "results",
            label: "<Results>, reads the query",
            children: [
              { id: "row-1", label: "<Row 1>" },
              { id: "row-2", label: "<Row 2>" },
              { id: "row-3", label: "<Row 3>" },
            ],
          },
          { id: "expensive", label: "<ExpensiveChart>, reads nothing" },
        ],
      },
    ],
  },
];

const READERS = ["search", "results"];

type Placement = "app" | "page" | "toolbar" | "search";

const ADVICE: Record<Placement, string> = {
  app: "Far too high. Every keystroke re-renders the header, the chart and every row.",
  page: "Still high, but this is the lowest common ancestor of the input and the results, the correct place if both must see it.",
  toolbar:
    "Too low: <Results> can no longer read the query without lifting it back up or routing it through context.",
  search: "Correct only if nothing outside the input needs the value, a local draft, for example.",
};

export default function StatePlacementSim() {
  const [placement, setPlacement] = useState<Placement>("app");

  const { rendered, broken } = useMemo(() => {
    const ids = new Set(subtreeIds(TREE, placement));
    const canReach = (id: string) => ids.has(id);
    return {
      rendered: ids,
      broken: READERS.filter((r) => !canReach(r)),
    };
  }, [placement]);

  const stateOf = (id: string): NodeState => {
    if (id === placement) return "owner";
    if (rendered.has(id)) return "render";
    return "idle";
  };

  return (
    <SimFrame
      code="BENCH-04C"
      title="State placement"
      status={broken.length ? "UNREACHABLE READERS" : `${rendered.size} RENDER`}
      controls={
        <ControlGroup label="useState lives in">
          <Segmented
            value={placement}
            columns={1}
            onChange={setPlacement}
            options={[
              { value: "app", label: "<App>" },
              { value: "page", label: "<Page>" },
              { value: "toolbar", label: "<Toolbar>" },
              { value: "search", label: "<SearchInput>" },
            ]}
          />
        </ControlGroup>
      }
      readout={
        <Readout
          rows={[
            ["Components re-rendered per keystroke", rendered.size],
            ["Wasted renders", Math.max(0, rendered.size - READERS.length - 1)],
            [
              "Readers out of scope",
              broken.length ? (
                <span className="text-rust" key="b">
                  {broken.join(", ")}
                </span>
              ) : (
                "none"
              ),
            ],
          ]}
        />
      }
      note={ADVICE[placement]}
    >
      <div className="p-4">
        <TreeView nodes={TREE} stateOf={stateOf} />
        <div className="border-line mt-4 flex flex-wrap gap-4 border-t pt-3">
          {(
            [
              ["owner", "owns the state"],
              ["render", "re-renders"],
              ["idle", "untouched"],
            ] as const
          ).map(([key, label]) => (
            <span
              key={key}
              className="text-2xs text-steel-dim flex items-center gap-2 font-mono uppercase"
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 border",
                  key === "owner"
                    ? "border-amber bg-amber/30"
                    : key === "render"
                      ? "border-rust bg-rust/25"
                      : "border-line",
                )}
              />
              {label}
            </span>
          ))}
        </div>
      </div>
    </SimFrame>
  );
}
