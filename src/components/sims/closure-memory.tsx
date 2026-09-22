"use client";

import { useMemo, useState } from "react";
import { MechanicalSwitch } from "@/components/ui/mechanical-switch";
import { cn } from "@/lib/cn";
import { ControlGroup, Readout, SimFrame } from "./sim-frame";

type NodeId =
  | "root"
  | "listener"
  | "context"
  | "buffer"
  | "domNode"
  | "detached"
  | "timer"
  | "cache"
  | "weakCache";

type GraphNode = {
  id: NodeId;
  label: string;
  detail: string;
  bytes: number;
  column: number;
};

const NODES: GraphNode[] = [
  {
    id: "root",
    label: "GC roots",
    detail: "global object, stack, live handles",
    bytes: 0,
    column: 0,
  },
  {
    id: "domNode",
    label: "#panel (in document)",
    detail: "attached DOM element",
    bytes: 12_000,
    column: 1,
  },
  {
    id: "detached",
    label: "detached subtree",
    detail: "removed from the document, still referenced",
    bytes: 480_000,
    column: 1,
  },
  {
    id: "timer",
    label: "setInterval handle",
    detail: "a root for as long as it is not cleared",
    bytes: 500,
    column: 1,
  },
  { id: "listener", label: "click handler", detail: "function object", bytes: 900, column: 2 },
  {
    id: "context",
    label: "closure context",
    detail: "one shared record per enclosing scope",
    bytes: 1_200,
    column: 2,
  },
  {
    id: "cache",
    label: "Map cache",
    detail: "module scope, lives as long as the module",
    bytes: 64_000,
    column: 2,
  },
  {
    id: "weakCache",
    label: "WeakMap cache",
    detail: "keys do not count as retaining edges",
    bytes: 64_000,
    column: 2,
  },
  { id: "buffer", label: "hugeBuffer", detail: "Array(1_000_000)", bytes: 8_000_000, column: 3 },
];

export default function ClosureMemorySim() {
  const [listenerAttached, setListenerAttached] = useState(true);
  const [secondListenerUsesBuffer, setSecondListenerUsesBuffer] = useState(true);
  const [nodeDetached, setNodeDetached] = useState(true);
  const [detachedReferenced, setDetachedReferenced] = useState(true);
  const [intervalRunning, setIntervalRunning] = useState(true);
  const [useWeakMap, setUseWeakMap] = useState(false);

  const edges = useMemo(() => {
    const e: [NodeId, NodeId][] = [["root", "domNode"]];
    if (listenerAttached) e.push(["domNode", "listener"], ["listener", "context"]);
    if (secondListenerUsesBuffer && listenerAttached) e.push(["context", "buffer"]);
    if (nodeDetached && detachedReferenced) e.push(["root", "detached"]);
    if (!nodeDetached) e.push(["domNode", "detached"]);
    if (intervalRunning) e.push(["root", "timer"], ["timer", "context"]);
    e.push(["root", useWeakMap ? "weakCache" : "cache"]);
    if (!useWeakMap) e.push(["cache", "detached"]);
    return e;
  }, [
    listenerAttached,
    secondListenerUsesBuffer,
    nodeDetached,
    detachedReferenced,
    intervalRunning,
    useWeakMap,
  ]);

  const reachable = useMemo(() => {
    const adjacency = new Map<NodeId, NodeId[]>();
    for (const [from, to] of edges) {
      adjacency.set(from, [...(adjacency.get(from) ?? []), to]);
    }
    const seen = new Set<NodeId>(["root"]);
    const queue: NodeId[] = ["root"];
    while (queue.length) {
      const id = queue.shift()!;
      for (const next of adjacency.get(id) ?? []) {
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      }
    }
    return seen;
  }, [edges]);

  const retained = NODES.filter((n) => reachable.has(n.id)).reduce((sum, n) => sum + n.bytes, 0);
  const collectable = NODES.filter((n) => !reachable.has(n.id));

  return (
    <SimFrame
      code="BENCH-03C"
      title="Retention graph"
      status={retained > 1_000_000 ? "LEAK SUSPECTED" : "HEALTHY"}
      controls={
        <>
          <ControlGroup label="Listeners">
            <MechanicalSwitch
              label="click listener attached"
              checked={listenerAttached}
              onChange={setListenerAttached}
            />
            <MechanicalSwitch
              label="sibling closure uses hugeBuffer"
              hint="Closures in one scope share a context object"
              tone="amber"
              checked={secondListenerUsesBuffer}
              onChange={setSecondListenerUsesBuffer}
            />
          </ControlGroup>
          <ControlGroup label="DOM">
            <MechanicalSwitch
              label="subtree removed from document"
              checked={nodeDetached}
              onChange={setNodeDetached}
            />
            <MechanicalSwitch
              label="JS variable still points at it"
              tone="rust"
              checked={detachedReferenced}
              onChange={setDetachedReferenced}
            />
          </ControlGroup>
          <ControlGroup label="Other roots">
            <MechanicalSwitch
              label="setInterval still running"
              tone="rust"
              checked={intervalRunning}
              onChange={setIntervalRunning}
            />
            <MechanicalSwitch
              label="cache uses WeakMap"
              checked={useWeakMap}
              onChange={setUseWeakMap}
            />
          </ControlGroup>
        </>
      }
      readout={
        <Readout
          rows={[
            ["Reachable objects", `${reachable.size} / ${NODES.length}`],
            [
              "Retained",
              <span className={retained > 1_000_000 ? "text-rust" : "text-crt"} key="r">
                {(retained / 1_000_000).toFixed(2)} MB
              </span>,
            ],
            [
              "Collectable",
              collectable.length === 0 ? "nothing" : collectable.map((n) => n.label).join(", "),
            ],
          ]}
        />
      }
    >
      <div className="p-4">
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((column) => (
            <div key={column} className="space-y-2">
              <p className="text-2xs text-steel-dim font-medium tracking-[0.08em] uppercase">
                {["roots", "owners", "closures", "payload"][column]}
              </p>
              {NODES.filter((n) => n.column === column).map((node) => {
                const live = reachable.has(node.id);
                return (
                  <div
                    key={node.id}
                    className={cn(
                      "border px-2 py-2 transition-colors",
                      live
                        ? node.bytes > 1_000_000
                          ? "border-rust/60 bg-rust/10"
                          : "border-crt/40 bg-crt/[0.06]"
                        : "border-line bg-ink-900/40 border-dashed opacity-45",
                    )}
                  >
                    <p
                      className={cn(
                        "text-2xs font-mono leading-tight",
                        live
                          ? node.bytes > 1_000_000
                            ? "text-rust"
                            : "text-crt"
                          : "text-steel-dim line-through",
                      )}
                    >
                      {node.label}
                    </p>
                    <p className="text-2xs text-steel-dim mt-1 leading-snug">{node.detail}</p>
                    {node.bytes > 0 ? (
                      <p className="text-2xs text-steel mt-1 font-mono tabular-nums">
                        {node.bytes >= 1_000_000
                          ? `${(node.bytes / 1_000_000).toFixed(1)}MB`
                          : `${(node.bytes / 1000).toFixed(1)}KB`}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </SimFrame>
  );
}
