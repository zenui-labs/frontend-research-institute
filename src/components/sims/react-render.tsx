"use client";

import { useMemo, useState } from "react";
import { MechanicalSwitch } from "@/components/ui/mechanical-switch";
import { ControlGroup, Readout, SimFrame } from "./sim-frame";
import { TreeView, flattenTree, subtreeIds, type NodeState, type TreeNode } from "./react-tree";

const TREE: TreeNode[] = [
  {
    id: "app",
    label: "<App>",
    children: [
      { id: "header", label: "<Header>" },
      {
        id: "sidebar",
        label: "<Sidebar>",
        children: [
          { id: "nav", label: "<Nav>" },
          { id: "user", label: "<UserCard>, reads ThemeContext" },
        ],
      },
      {
        id: "content",
        label: "<Content>",
        children: [
          { id: "post", label: "<Post>" },
          {
            id: "comments",
            label: "<Comments>",
            children: [
              { id: "comment-1", label: "<Comment id=1>" },
              { id: "comment-2", label: "<Comment id=2>" },
            ],
          },
          { id: "chart", label: "<Chart options={…}>" },
        ],
      },
    ],
  },
];

const ALL = flattenTree(TREE).map((n) => n.id);
const CONTEXT_CONSUMERS = ["user"];

export default function ReactRenderSim() {
  const [owner, setOwner] = useState("app");
  const [memoSidebar, setMemoSidebar] = useState(false);
  const [memoContent, setMemoContent] = useState(false);
  const [inlineOptions, setInlineOptions] = useState(true);
  const [contextChanged, setContextChanged] = useState(false);
  const [childrenAsProp, setChildrenAsProp] = useState(false);

  const rendered = useMemo(() => {
    const affected = new Set<string>();
    const walk = (id: string, isOwner: boolean) => {
      affected.add(id);
      const memoised = (id === "sidebar" && memoSidebar) || (id === "content" && memoContent);
      // A memoised child bails out unless it receives a fresh reference.
      const receivesUnstable = id === "content" && inlineOptions;
      if (!isOwner && memoised && !receivesUnstable) return;
      // children-as-prop: the subtree element was created by the owner's parent,
      // so it is not re-created and React reuses it.
      if (!isOwner && childrenAsProp && id === "content") return;
      for (const child of subtreeIds(TREE, id).slice(1)) {
        const parentOfChild = flattenTree(TREE).find((n) =>
          n.children?.some((c) => c.id === child),
        );
        if (parentOfChild?.id === id) walk(child, false);
      }
    };
    walk(owner, true);
    if (contextChanged) CONTEXT_CONSUMERS.forEach((id) => affected.add(id));
    return affected;
  }, [owner, memoSidebar, memoContent, inlineOptions, contextChanged, childrenAsProp]);

  const stateOf = (id: string): NodeState => {
    if (id === owner) return "owner";
    if (rendered.has(id)) return "render";
    const parentRendered = flattenTree(TREE).some(
      (n) => n.children?.some((c) => c.id === id) && rendered.has(n.id),
    );
    return parentRendered ? "skip" : "idle";
  };

  const renderedCount = rendered.size;

  return (
    <SimFrame
      code="BENCH-04A"
      title="Render propagation"
      status={`${renderedCount} / ${ALL.length} RENDERED`}
      controls={
        <>
          <ControlGroup label="Memoisation">
            <MechanicalSwitch
              label="memo(Sidebar)"
              checked={memoSidebar}
              onChange={setMemoSidebar}
            />
            <MechanicalSwitch
              label="memo(Content)"
              checked={memoContent}
              onChange={setMemoContent}
            />
            <MechanicalSwitch
              label="inline options object"
              hint="A fresh reference every render defeats memo"
              tone="rust"
              checked={inlineOptions}
              onChange={setInlineOptions}
            />
          </ControlGroup>
          <ControlGroup label="Structure">
            <MechanicalSwitch
              label="pass Content as children"
              hint="The element is created by the parent, so it is not re-created"
              checked={childrenAsProp}
              onChange={setChildrenAsProp}
            />
            <MechanicalSwitch
              label="ThemeContext value changed"
              tone="amber"
              checked={contextChanged}
              onChange={setContextChanged}
            />
          </ControlGroup>
        </>
      }
      readout={
        <Readout
          rows={[
            ["setState called in", owner],
            ["Components rendered", renderedCount],
            ["Bailed out", ALL.length - renderedCount],
            [
              "Dominant cause",
              owner === "app"
                ? "state at the root, the whole tree is in scope"
                : contextChanged
                  ? "context consumers render wherever they are"
                  : "normal downward propagation",
            ],
          ]}
        />
      }
    >
      <div className="p-4">
        <p className="label-tech mb-3">Click a component to change its state</p>
        <TreeView nodes={TREE} stateOf={stateOf} onSelect={setOwner} selectedId={owner} />
      </div>
    </SimFrame>
  );
}
