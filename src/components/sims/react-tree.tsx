"use client";

import { cn } from "@/lib/cn";

export type TreeNode = {
  id: string;
  label: string;
  children?: TreeNode[];
};

export type NodeState = "render" | "skip" | "owner" | "idle";

const STATE_STYLE: Record<NodeState, string> = {
  owner: "border-amber/70 bg-amber/15 text-amber",
  render: "border-rust/50 bg-rust/10 text-rust",
  skip: "border-crt/40 bg-crt/[0.07] text-crt",
  idle: "border-line bg-ink-900/40 text-steel-dim",
};

const STATE_LABEL: Record<NodeState, string> = {
  owner: "state changed",
  render: "re-rendered",
  skip: "bailed out",
  idle: "untouched",
};

export function TreeView({
  nodes,
  stateOf,
  onSelect,
  selectedId,
  depth = 0,
}: {
  nodes: TreeNode[];
  stateOf: (id: string) => NodeState;
  onSelect?: (id: string) => void;
  selectedId?: string;
  depth?: number;
}) {
  return (
    <ul className={cn("space-y-1.5", depth > 0 && "border-line mt-1.5 ml-4 border-l pl-4")}>
      {nodes.map((node) => {
        const state = stateOf(node.id);
        const Tag = onSelect ? "button" : "div";
        return (
          <li key={node.id}>
            <Tag
              {...(onSelect
                ? {
                    type: "button" as const,
                    onClick: () => onSelect(node.id),
                    "aria-pressed": selectedId === node.id,
                  }
                : {})}
              className={cn(
                "flex w-full items-center justify-between gap-3 border px-2.5 py-1.5 text-left transition-colors",
                STATE_STYLE[state],
                onSelect && "hover:border-line-bright",
                selectedId === node.id && "ring-amber/50 ring-1",
              )}
            >
              <span className="truncate font-mono text-xs">{node.label}</span>
              <span className="text-2xs shrink-0 font-medium tracking-[0.1em] uppercase opacity-70">
                {STATE_LABEL[state]}
              </span>
            </Tag>
            {node.children?.length ? (
              <TreeView
                nodes={node.children}
                stateOf={stateOf}
                onSelect={onSelect}
                selectedId={selectedId}
                depth={depth + 1}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function flattenTree(nodes: TreeNode[], acc: TreeNode[] = []): TreeNode[] {
  for (const node of nodes) {
    acc.push(node);
    if (node.children) flattenTree(node.children, acc);
  }
  return acc;
}

export function pathTo(nodes: TreeNode[], id: string, trail: string[] = []): string[] | null {
  for (const node of nodes) {
    const next = [...trail, node.id];
    if (node.id === id) return next;
    if (node.children) {
      const found = pathTo(node.children, id, next);
      if (found) return found;
    }
  }
  return null;
}

export function subtreeIds(nodes: TreeNode[], id: string): string[] {
  for (const node of nodes) {
    if (node.id === id) return flattenTree([node]).map((n) => n.id);
    if (node.children) {
      const found = subtreeIds(node.children, id);
      if (found.length) return found;
    }
  }
  return [];
}
