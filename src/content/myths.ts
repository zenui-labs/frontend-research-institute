import type { Myth } from "./types";

export const MYTHS: Myth[] = [
  {
    id: "important",
    number: 1,
    slug: "just-add-important",
    claim: "Just add !important.",
    verdict: "BUSTED",
    lab: "css",
    difficulty: "DEVELOPER",
    shortAnswer:
      "It works exactly once. Then it becomes the thing the next person has to defeat, and the only way to defeat it is another !important.",
    body: [
      {
        type: "prose",
        text: "`!important` does not raise specificity, it moves the declaration into a different **cascade origin layer**. Author-important beats author-normal, and the only thing that beats author-important is user-important, or another author-important declaration with higher specificity.",
      },
      {
        type: "table",
        caption: "Cascade origin order, lowest to highest priority",
        head: ["#", "Origin"],
        rows: [
          ["1", "User-agent normal"],
          ["2", "User normal"],
          ["3", "Author normal (including @layer, in layer order)"],
          ["4", "Animations"],
          ["5", "Author !important (layer order reverses here)"],
          ["6", "User !important"],
          ["7", "User-agent !important"],
          ["8", "Transitions"],
        ],
      },
      {
        type: "prose",
        text: "Cascade layers give you the outcome people reach for `!important` to get, without the escalation. Declarations in a later layer beat earlier layers regardless of specificity, so a `reset` layer can use whatever selectors it likes and still lose to `components`.",
      },
      {
        type: "code",
        lang: "css",
        code: `@layer reset, framework, components, utilities;

@layer framework {
 #sidebar .nav a { color: blue; } /* high specificity… */
}

@layer utilities {
 .text-ink { color: black; } /* …still wins: later layer */
}`,
      },
      {
        type: "callout",
        variant: "note",
        title: "Where it is legitimate",
        text: "Utility classes that must win by design, and overriding third-party styles you cannot edit. Both are cases where you are deliberately declaring a final answer, not losing an argument with your own stylesheet.",
      },
    ],
    references: [
      {
        label: "Cascade",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Cascade",
      },
      {
        label: "CSS Cascading and Inheritance Level 5",
        source: "W3C",
        url: "https://www.w3.org/TR/css-cascade-5/",
      },
    ],
  },
  {
    id: "react-slow",
    number: 2,
    slug: "react-is-slow",
    claim: "React is slow.",
    verdict: "IT DEPENDS",
    lab: "react",
    difficulty: "ENGINEER",
    shortAnswer:
      "React's own work is rarely the bottleneck. The tree shape, the amount of JavaScript shipped, and what happens during hydration usually are.",
    body: [
      {
        type: "prose",
        text: "Rendering a component is a function call and an object comparison. Measured in isolation, that is fast. What makes React applications slow is almost always one of four structural things:",
      },
      {
        type: "steps",
        items: [
          "Render waves: state placed high in the tree so every keystroke re-renders thousands of components.",
          "Payload: a large client bundle that must be downloaded, parsed, compiled and executed before anything is interactive.",
          "Hydration: the server sent HTML, then the client re-does the work to attach behaviour, paying for the page twice.",
          "Everything else: a date library, an icon set imported wholesale, and a chart component that ships its own copy of the same maths.",
        ],
      },
      {
        type: "callout",
        variant: "fact",
        title: "Honest accounting",
        text: "A framework has a real, non-zero cost: runtime bytes plus reconciliation work. On a fast device with a well-structured tree that cost is invisible. On a low-end phone with a 4MB bundle it is the entire experience. Both statements are true, which is why the blanket claim is not.",
      },
      {
        type: "prose",
        text: "The productive version of the question is 'slow at what?'. Interaction latency, first load and navigation are three different problems with three different fixes, and only one of them is affected by how fast reconciliation runs.",
      },
    ],
    references: [
      {
        label: "React Compiler",
        source: "React docs",
        url: "https://react.dev/learn/react-compiler",
      },
      { label: "Optimize INP", source: "web.dev", url: "https://web.dev/articles/optimize-inp" },
    ],
  },
  {
    id: "more-memo",
    number: 3,
    slug: "more-memoization-more-performance",
    claim: "More memoization = more performance.",
    verdict: "BUSTED",
    lab: "react",
    difficulty: "ENGINEER",
    shortAnswer:
      "Every memo has a cost: the comparison, the retained references, and the dependency array you now have to keep correct. Applied blindly, it is a net loss.",
    body: [
      {
        type: "prose",
        text: "`useMemo` and `useCallback` trade CPU and memory for the chance to skip work later. That trade pays off only when three things are true: the skipped work is expensive, the dependencies genuinely stay stable, and the consumer can actually bail out.",
      },
      {
        type: "code",
        lang: "jsx",
        caption: "Memoisation that cannot possibly help",
        code: `// The child is not memoised, so it re-renders anyway.
// All this adds is a comparison and a retained closure.
const onClick = useCallback(() => setOpen(true), []);
return <Button onClick={onClick} />;`,
      },
      {
        type: "prose",
        text: "Memoisation also keeps values alive. A `useMemo` holding a large derived array retains it for the lifetime of the component, which is the desired behaviour when it is expensive to recompute, and a leak when it is not.",
      },
      {
        type: "callout",
        variant: "note",
        title: "Better first moves",
        text: "Move state down. Pass subtrees as children. Split contexts. Virtualise long lists. These change the amount of work rather than caching it, and none of them require a dependency array.",
      },
      {
        type: "prose",
        text: "The React Compiler changes the economics: it inserts memoisation automatically where it can prove the component is pure, which removes both the manual effort and the class of bugs caused by wrong dependency arrays.",
      },
    ],
    references: [
      {
        label: "useMemo, when to use",
        source: "React docs",
        url: "https://react.dev/reference/react/useMemo#should-you-add-usememo-everywhere",
      },
      {
        label: "React Compiler",
        source: "React docs",
        url: "https://react.dev/learn/react-compiler",
      },
    ],
  },
  {
    id: "smaller-bundle",
    number: 4,
    slug: "a-smaller-bundle-is-always-faster",
    claim: "A smaller bundle is always faster.",
    verdict: "PARTLY TRUE",
    lab: "performance",
    difficulty: "SYSTEMS",
    shortAnswer:
      "Smaller usually helps, but *when* bytes arrive and *what* they do on arrival matter more than the total.",
    body: [
      {
        type: "prose",
        text: "Splitting a 500KB bundle into ten 50KB chunks does not make the page faster if the critical path now needs six of them in sequence. Each additional request on the critical path costs a round trip, and a waterfall of small files can easily lose to one larger file.",
      },
      {
        type: "table",
        head: ["Change", "Usually helps", "Can backfire"],
        rows: [
          ["Remove an unused dependency", "Always", ""],
          ["Route-level code splitting", "Yes", "If the split point is on the critical path"],
          ["Component-level splitting", "Sometimes", "Waterfalls, layout shift on late arrival"],
          [
            "Inlining critical CSS",
            "Yes for first paint",
            "Uncacheable; bloats every HTML response",
          ],
          ["Deferring all scripts", "Yes", "Delays hydration if interaction comes early"],
        ],
      },
      {
        type: "callout",
        variant: "fact",
        title: "Bytes are not the unit of cost",
        text: "100KB of JSON parses far faster than 100KB of JavaScript, which must be parsed, compiled and executed. Comparing formats by transfer size alone consistently misleads.",
      },
    ],
    references: [
      {
        label: "Reduce JavaScript payloads with code splitting",
        source: "web.dev",
        url: "https://web.dev/articles/reduce-javascript-payloads-with-code-splitting",
      },
      {
        label: "Understanding the critical path",
        source: "web.dev",
        url: "https://web.dev/learn/performance/understanding-the-critical-path",
      },
    ],
  },
  {
    id: "lighthouse-100",
    number: 5,
    slug: "100-lighthouse-means-perfect",
    claim: "100 Lighthouse means your website is perfect.",
    verdict: "BUSTED",
    lab: "performance",
    difficulty: "DEVELOPER",
    shortAnswer:
      "Lighthouse is a synthetic run on a simulated device, on your network, with no real user in sight. It is a useful ratchet, not a verdict.",
    body: [
      {
        type: "prose",
        text: "Lighthouse measures a single cold load under simulated throttling. Real users arrive with warm caches and cold ones, on flaky networks, on devices five years older than yours, from further away, with extensions installed, and they interact, which is where INP lives and where synthetic runs have the least to say.",
      },
      {
        type: "table",
        head: ["", "Lab (Lighthouse)", "Field (CrUX / RUM)"],
        rows: [
          ["Question answered", "Did my change help?", "What did users experience?"],
          ["Variance", "Low, reproducible", "High, real"],
          ["Interaction coverage", "Minimal", "Complete"],
          ["Device profile", "One simulated device", "Everything your users own"],
        ],
      },
      {
        type: "callout",
        variant: "warning",
        title: "The accessibility score is the most misread number on the report",
        text: "Automated tooling catches a minority of accessibility issues, missing names, contrast, obviously invalid ARIA. It cannot evaluate focus order, whether a custom widget is operable, or whether the page makes sense when announced linearly. A 100 there means 'no automated failures', not 'accessible'.",
      },
    ],
    references: [
      {
        label: "Lighthouse documentation",
        source: "Chrome",
        url: "https://developer.chrome.com/docs/lighthouse/overview",
      },
      {
        label: "Lab and field data",
        source: "web.dev",
        url: "https://web.dev/articles/lab-and-field-data-differences",
      },
    ],
  },
  {
    id: "useeffect-everything",
    number: 6,
    slug: "useeffect-is-for-everything",
    claim: "useEffect is for everything.",
    verdict: "BUSTED",
    lab: "react",
    difficulty: "DEVELOPER",
    shortAnswer:
      "An effect synchronises your component with an external system. If there is no external system, you probably do not need one.",
    body: [
      {
        type: "steps",
        title: "Things that are not effects",
        items: [
          "Deriving a value from props or state, compute it during render.",
          "Resetting state when a prop changes, change the key instead.",
          "Responding to a user event, put the logic in the event handler.",
          "Fetching data on mount, use the framework's data layer or a query library, which handles races, caching and cancellation.",
          "Transforming data for display, a plain function, memoised only if measurably expensive.",
        ],
      },
      {
        type: "prose",
        text: "The failure mode is an extra render plus a window where the two values disagree. An effect runs *after* paint, so the user can see the inconsistent frame.",
      },
      {
        type: "code",
        lang: "jsx",
        code: `// Renders twice, and the first frame shows the old total
useEffect(() => setTotal(items.reduce(sum, 0)), [items]);

// Renders once, always consistent
const total = items.reduce(sum, 0);`,
      },
      {
        type: "callout",
        variant: "note",
        title: "Legitimate effects",
        text: "Subscriptions, event listeners on window, timers, imperative third-party widgets, syncing to localStorage, analytics on navigation. Every one of them involves something outside React that must be set up and torn down.",
      },
    ],
    references: [
      {
        label: "You might not need an effect",
        source: "React docs",
        url: "https://react.dev/learn/you-might-not-need-an-effect",
      },
      {
        label: "Synchronizing with effects",
        source: "React docs",
        url: "https://react.dev/learn/synchronizing-with-effects",
      },
    ],
  },
  {
    id: "tailwind-no-css",
    number: 7,
    slug: "tailwind-means-you-dont-need-css",
    claim: "Tailwind means you don't need CSS knowledge.",
    verdict: "BUSTED",
    lab: "css",
    difficulty: "CURIOUS",
    shortAnswer:
      "Utility classes change how you write declarations. They do not change the box model, the cascade, stacking contexts or formatting contexts, and those are the parts that confuse people.",
    body: [
      {
        type: "prose",
        text: "`flex items-center gap-4` is `display: flex; align-items: center; gap: 1rem`. When the layout misbehaves, the debugging is identical: which formatting context, which containing block, which intrinsic size. A utility framework removes the naming problem and the dead-code problem. It does not remove the layout model.",
      },
      {
        type: "callout",
        variant: "fact",
        title: "What it genuinely solves",
        text: "Design token consistency, dead CSS elimination, and the fact that deleting a component now reliably deletes its styles. Those are real, meaningful wins, they are just not the same thing as not needing to understand CSS.",
      },
      {
        type: "prose",
        text: "The tell is `z-50` failing to put a dropdown above a header. No utility framework can fix that, because the cause is an ancestor stacking context, a concept that exists one layer below whatever syntax you are writing.",
      },
    ],
    references: [
      {
        label: "The stacking context",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context",
      },
      {
        label: "CSS Display Module Level 3",
        source: "W3C",
        url: "https://www.w3.org/TR/css-display-3/",
      },
    ],
  },
  {
    id: "cache-always-faster",
    number: 8,
    slug: "adding-a-cache-always-makes-it-faster",
    claim: "Adding a cache always makes it faster.",
    verdict: "IT DEPENDS",
    lab: "networking",
    difficulty: "SYSTEMS",
    shortAnswer:
      "A cache with a poor hit rate adds a lookup, a write, an eviction policy and an invalidation bug, in exchange for very little.",
    body: [
      {
        type: "prose",
        text: "Cache benefit is roughly `hit_rate × saved_cost − overhead`. At a 10% hit rate on an operation that was already fast, the overhead dominates. Worse, a cache changes the failure mode: instead of being slow, the system is now occasionally wrong, and wrong is harder to notice.",
      },
      {
        type: "table",
        head: ["Failure", "Symptom"],
        rows: [
          ["Stale entry", "Users see old data; the bug is invisible in staging"],
          ["Cache stampede", "The entry expires under load and every request rebuilds it at once"],
          [
            "Key collision",
            "One user sees another user's data, a cache bug that is a security incident",
          ],
          ["Unbounded growth", "Memory rises until something is evicted or something dies"],
          ["Cached error", "A 500 is stored and served happily for an hour"],
        ],
      },
      {
        type: "callout",
        variant: "note",
        title: "Cheaper alternatives to try first",
        text: "Delete the request entirely. Fetch fewer fields. Move the work to build time. Add an index. Deduplicate concurrent identical requests, often most of what a cache was doing for you, with none of the staleness.",
      },
    ],
    references: [
      {
        label: "HTTP caching",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching",
      },
      {
        label: "Prevent unnecessary network requests with the HTTP Cache",
        source: "web.dev",
        url: "https://web.dev/articles/http-cache",
      },
    ],
  },
];
