import type { Experiment } from "../types";

export const REACT_EXPERIMENTS: Experiment[] = [
  {
    id: "why-render",
    number: 11,
    slug: "why-did-this-component-render",
    title: "Why did this component render?",
    lab: "react",
    difficulty: "DEVELOPER",
    estimatedMinutes: 10,
    type: "SIMULATION",
    summary:
      "Nothing it displays changed. It rendered anyway. Four causes, and only one of them is a bug.",
    question:
      "A leaf component re-renders on every keystroke in an unrelated input. Its props look identical. What actually triggers a render?",
    hypothesis:
      "A component renders when its own state changes, when its context value changes, or when its parent renders, and by default, the last one does not care whether props changed.",
    concepts: ["render phase", "commit phase", "referential equality", "memo", "context"],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "Change state at different points in the tree and watch the render wave travel. Toggle `memo` and stable references to see where the wave stops.",
        },
        { type: "sim", sim: "react-render", caption: "Render propagation bench. LAB-04" },
      ],
      observation: [
        {
          type: "table",
          head: ["Trigger", "What re-renders"],
          rows: [
            ["setState in a component", "That component and its entire subtree"],
            ["Parent re-renders", "All children, memoised or not, unless memo + equal props"],
            ["Context value changes", "Every consumer of that context, wherever it sits"],
            ["New key on an element", "Old instance unmounts, new one mounts with fresh state"],
            ["Ref changes", "Nothing, refs do not trigger renders"],
          ],
        },
        {
          type: "callout",
          variant: "fact",
          title: "Documented fact",
          text: "Rendering is not the same as updating the DOM. React renders (calls your function), diffs the result, and commits only the differences. A re-render with an identical output touches zero DOM nodes, it costs the function call and the diff, not a repaint.",
        },
      ],
      explanation: [
        {
          type: "prose",
          text: "The usual culprit is a new reference created during render. Objects, arrays, inline functions and JSX elements are fresh values on every call, so a `memo`'d child that receives one is never actually memoised.",
        },
        {
          type: "code",
          lang: "jsx",
          caption: "Three references that defeat memo",
          code: `// New object every render
<Chart options={{ animate: true }} />

// New function every render
<Row onSelect={() => select(row.id)} />

// New array every render
<List items={data.filter(Boolean)} />

// Stable alternatives
const options = useMemo(() => ({ animate: true }), []);
const onSelect = useCallback((id) => select(id), [select]);
const items = useMemo(() => data.filter(Boolean), [data]);`,
        },
        {
          type: "prose",
          text: "The structural fix is usually better than the memo fix. If the state that changes on every keystroke lives above a large subtree, moving that state *down* into the component that uses it removes the render wave entirely, no `memo`, no dependency arrays, no stale-closure bugs.",
        },
        {
          type: "code",
          lang: "jsx",
          caption: "Composition beats memoisation",
          code: `// Every keystroke re-renders <ExpensiveTree />
function Page() {
 const [q, setQ] = useState("");
 return (
 <>
 <input value={q} onChange={(e) => setQ(e.target.value)} />
 <ExpensiveTree />
 </>
 );
}

// The subtree is passed as children, so it is not re-created
function Page() {
 return (
 <SearchBox>
 <ExpensiveTree />
 </SearchBox>
 );
}`,
        },
        {
          type: "why",
          question: "Why does React re-render children by default?",
          chain: {
            answer:
              "Because it cannot know whether a child's output depends on something it cannot see.",
            next: {
              answer:
                "A child may read context, a module-level variable, or a mutable object. Skipping it could render a stale UI.",
              next: {
                answer:
                  "Re-rendering is the safe default; skipping is the opt-in. That is exactly what `memo` is, a promise from you that the output is a pure function of the props.",
                next: {
                  answer:
                    "If that promise is false, the component reads mutable state, memo turns a correctness problem into an intermittent one. This is why the React Compiler applies the optimisation automatically only where it can prove purity.",
                },
              },
            },
          },
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "In development, React's StrictMode intentionally double-invokes component bodies, initialisers and effects to surface impure renders. It does not do this in production. A component that behaves differently under StrictMode has a side effect in its render path.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Measure before memoising",
          text: "The React DevTools Profiler shows why each component rendered when 'Record why each component rendered' is enabled. Memoising without that data usually adds dependency arrays, allocation and bugs without moving a single millisecond.",
        },
      ],
    },
    references: [
      {
        label: "Render and commit",
        source: "React docs",
        url: "https://react.dev/learn/render-and-commit",
      },
      { label: "memo", source: "React docs", url: "https://react.dev/reference/react/memo" },
      {
        label: "React Compiler",
        source: "React docs",
        url: "https://react.dev/learn/react-compiler",
      },
    ],
    related: ["keys-reconciliation", "state-placement", "closure-memory"],
  },
  {
    id: "keys-reconciliation",
    number: 12,
    slug: "reconciliation-investigation",
    title: "Reconciliation investigation",
    lab: "react",
    difficulty: "ENGINEER",
    estimatedMinutes: 9,
    type: "INTERACTIVE",
    summary:
      "Delete the first row of a list and the wrong checkbox stays ticked. The list is correct. The keys are not.",
    question:
      "Why does using an array index as a key cause state to attach to the wrong item, while a stable id does not?",
    hypothesis:
      "Keys identify an element between renders. With index keys, removing an item shifts every subsequent identity by one, so React reuses the wrong component instance and its state travels to a different row.",
    concepts: ["reconciliation", "keys", "component identity", "state preservation"],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "Two identical lists, one keyed by index and one by id. Type into a row, then delete a row above it.",
        },
        { type: "sim", sim: "react-keys", caption: "Reconciliation bench. LAB-04" },
      ],
      observation: [
        {
          type: "prose",
          text: "The id-keyed list keeps every input attached to its own row. The index-keyed list drags the text upward: the instance that used to be `key=1` is reused for whatever is now at index 1.",
        },
        {
          type: "callout",
          variant: "fact",
          title: "Documented fact",
          text: "React matches children by key within a single parent. Same key → same component instance, state preserved. Different key → the old instance is unmounted and a new one is mounted with fresh state.",
        },
      ],
      explanation: [
        {
          type: "prose",
          text: "Reconciliation compares the new element tree with the previous one, one level at a time, using two heuristics: elements of a different **type** produce a full remount, and elements with the same key are assumed to be the same logical item. This is what makes the diff linear instead of a general tree-edit-distance problem.",
        },
        {
          type: "code",
          lang: "jsx",
          code: `// Identity shifts when the list mutates
{rows.map((row, i) => <Row key={i} row={row} />)}

// Identity follows the data
{rows.map((row) => <Row key={row.id} row={row} />)}`,
        },
        {
          type: "table",
          head: ["Key strategy", "Safe when"],
          rows: [
            ["Stable domain id", "Always preferred"],
            ["Array index", "The list is static, never reordered, filtered or spliced"],
            [
              "Math.random()",
              "Never. Every render remounts every row and destroys state and focus",
            ],
            ["Composite `${a}-${b}`", "Fine, as long as the composite is unique and stable"],
          ],
        },
        {
          type: "prose",
          text: "The same mechanism can be used deliberately. Changing a key is the documented way to reset a component's state, for example `<Form key={userId} />` gives each user a clean form without a manual reset effect.",
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "Under the Fiber architecture, reconciliation happens during the render phase, which is interruptible: React can pause, abandon or restart it. The commit phase, where the DOM is actually mutated, is synchronous and cannot be interrupted, which is why side effects belong in effects rather than in render.",
        },
      ],
    },
    references: [
      {
        label: "Preserving and resetting state",
        source: "React docs",
        url: "https://react.dev/learn/preserving-and-resetting-state",
      },
      {
        label: "Rendering lists, keys",
        source: "React docs",
        url: "https://react.dev/learn/rendering-lists#why-does-react-need-keys",
      },
    ],
    related: ["why-render", "state-placement"],
  },
  {
    id: "state-placement",
    number: 13,
    slug: "state-placement-experiment",
    title: "State placement experiment",
    lab: "react",
    difficulty: "DEVELOPER",
    estimatedMinutes: 8,
    type: "INTERACTIVE",
    summary:
      "The same feature, built three times. Only the location of one `useState` changes. The performance profile does not survive it.",
    question:
      "Where should state live: at the top for convenience, or as low as possible for performance?",
    hypothesis:
      "State should live at the lowest common ancestor of everything that reads it. Higher costs unnecessary renders; lower forces synchronisation bugs.",
    concepts: ["lifting state", "colocation", "derived state", "render scope"],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "Move the state marker up and down the tree. The bench highlights which components re-render on each update and counts the work.",
        },
        { type: "sim", sim: "state-placement", caption: "State placement bench. LAB-04" },
      ],
      observation: [
        {
          type: "prose",
          text: "Every level you lift state costs you the render of the entire subtree below the new owner. Every level you push it down removes components from the render wave, often without any memoisation at all.",
        },
      ],
      explanation: [
        {
          type: "steps",
          title: "Placement rules that hold up in practice",
          items: [
            "Find every component that reads the value. Put the state at their lowest common ancestor.",
            "If only one component reads it, it belongs inside that component.",
            "Do not store what you can compute: derived values belong in the render body, not in a second useState kept in sync by an effect.",
            "If the value is genuinely global (theme, session), context is correct, but split contexts so a fast-changing value does not re-render consumers of a slow-changing one.",
            "If a parent must hold the state but the subtree does not depend on it, pass the subtree as `children`.",
          ],
        },
        {
          type: "code",
          lang: "jsx",
          caption: "Derived state is a bug generator",
          code: `// Two sources of truth, kept in sync by hand
const [items, setItems] = useState([]);
const [count, setCount] = useState(0);
useEffect(() => setCount(items.length), [items]); // extra render, can desync

// One source of truth
const [items, setItems] = useState([]);
const count = items.length;`,
        },
        {
          type: "callout",
          variant: "note",
          title: "Server state is not UI state",
          text: "Data fetched from a server has different rules: caching, revalidation, request de-duplication and error recovery. A query library or the framework's own data layer owns that; `useState` + `useEffect` reimplements it badly.",
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "React 18's automatic batching groups every `setState` in the same event, including inside promises, timeouts and native handlers, into a single render. `useTransition` goes further: it marks an update as non-urgent so React can keep the input responsive and interrupt the expensive render if a keystroke arrives.",
        },
      ],
    },
    references: [
      {
        label: "Choosing the state structure",
        source: "React docs",
        url: "https://react.dev/learn/choosing-the-state-structure",
      },
      {
        label: "You might not need an effect",
        source: "React docs",
        url: "https://react.dev/learn/you-might-not-need-an-effect",
      },
      {
        label: "useTransition",
        source: "React docs",
        url: "https://react.dev/reference/react/useTransition",
      },
    ],
    related: ["why-render", "keys-reconciliation", "perf-rescue"],
  },
];
