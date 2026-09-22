import type { Dossier } from "./types";

export const DOSSIERS: Dossier[] = [
  {
    id: "hidden-cost-js",
    number: 217,
    slug: "the-hidden-cost-of-javascript",
    title: "The Hidden Cost of JavaScript",
    field: "Web Performance",
    lab: "performance",
    difficulty: "RESEARCHER",
    status: "ACTIVE",
    abstract:
      "Transfer size is the cheapest part of shipping JavaScript. This dossier separates the four costs a script imposes, network, parse, compile, execute, and shows why the last three dominate on the devices most people actually own.",
    stats: { experiments: 14, observations: 27 },
    sections: [
      {
        heading: "Question",
        blocks: [
          {
            type: "prose",
            text: "Two pages transfer 300KB. One is interactive in 900ms, the other in 5.4s. The network conditions are identical. Where did the difference come from?",
          },
        ],
      },
      {
        heading: "Background",
        blocks: [
          {
            type: "prose",
            text: "A byte of JavaScript is not a byte of an image. An image is decoded once, often on another thread, and never again. A script must be downloaded, parsed into an AST or lazily pre-parsed, compiled to bytecode, executed, and then, if it is hot, re-optimised by the JIT. Every one of those steps happens on the main thread, and every one of them scales with the device's single-core performance.",
          },
          {
            type: "table",
            caption: "Rough cost profile for the same 300KB of gzipped script",
            head: ["Stage", "High-end laptop", "Mid-range phone"],
            rows: [
              ["Transfer (4G)", "~250ms", "~250ms"],
              ["Parse + compile", "~90ms", "~450ms"],
              ["Execute", "~120ms", "~700ms"],
              ["Hydration of the same UI", "~80ms", "~600ms"],
            ],
          },
          {
            type: "callout",
            variant: "model",
            title: "Simplified model",
            text: "These figures are illustrative orders of magnitude, not measurements from your application. The durable finding is the ratio: CPU-bound stages diverge by 4 to 6× across devices while transfer does not.",
          },
        ],
      },
      {
        heading: "Method",
        blocks: [
          {
            type: "steps",
            items: [
              "Record a trace on a throttled CPU profile (4× or 6×) rather than an unthrottled one.",
              "Separate 'Evaluate Script' from 'Compile Script' in the performance panel, they have different fixes.",
              "Attribute long animation frames with the LoAF API to find which script and which call site.",
              "Compare total blocking time before and after removing a single dependency, not after a batch of changes.",
            ],
          },
        ],
      },
      {
        heading: "Findings",
        blocks: [
          {
            type: "prose",
            text: "**Finding 1. Parse cost is proportional to code shipped, not code run.** V8 pre-parses everything it downloads to find function boundaries, then fully parses functions when first called. Shipping a large library and using one function still pays the pre-parse.",
          },
          {
            type: "prose",
            text: "**Finding 2. Hydration pays for the UI twice.** The server rendered the markup; the client then walks the same tree, creates the same component instances and attaches listeners. Hydration cost scales with component count, not with how much of the page the user can see.",
          },
          {
            type: "prose",
            text: "**Finding 3. Deferring is not the same as removing.** A deferred script still costs its full CPU budget; it just costs it later, often exactly when the user first tries to interact. Moving cost past the LCP measurement improves the score without improving the experience.",
          },
          {
            type: "prose",
            text: "**Finding 4. The cheapest script is the one never requested.** Server-rendered HTML with no client component, or a progressively enhanced form, has a parse cost of zero and an execution cost of zero, at every device tier.",
          },
        ],
      },
      {
        heading: "Interpretation",
        blocks: [
          {
            type: "prose",
            text: "The practical hierarchy is: delete it, then do it on the server, then load it later, then make it smaller. Most optimisation effort goes into the last step, which is the weakest lever in the list.",
          },
          {
            type: "why",
            question: "Why is parse cost so much higher on phones?",
            chain: {
              answer: "Because parsing is single-threaded work bounded by single-core performance.",
              next: {
                answer:
                  "Phone SoCs prioritise efficiency cores and thermal headroom, so sustained single-core throughput is far below a laptop's.",
                next: {
                  answer:
                    "Sustained load also triggers thermal throttling, so the second half of a long script can run slower than the first.",
                  next: {
                    answer:
                      "Which means the median device experience is not 'your laptop, but slower', it degrades non-linearly exactly when the page is doing the most work.",
                  },
                },
              },
            },
          },
        ],
      },
      {
        heading: "Limitations",
        blocks: [
          {
            type: "prose",
            text: "Engine behaviour differs. V8, SpiderMonkey and JavaScriptCore make different lazy-parsing and tiering decisions, and all three change between releases. Treat the mechanism as stable and the numbers as perishable.",
          },
        ],
      },
      {
        heading: "Further research",
        blocks: [
          {
            type: "steps",
            items: [
              "Measure hydration cost per route on a 4× throttled CPU.",
              "Quantify the parse cost of your three largest dependencies individually.",
              "Test whether a route needs client-side JavaScript at all.",
            ],
          },
        ],
      },
    ],
    references: [
      {
        label: "The cost of JavaScript",
        source: "Addy Osmani",
        url: "https://medium.com/@addyosmani/the-cost-of-javascript-in-2023-ac691b0a4f66",
      },
      { label: "Blazingly fast parsing", source: "V8 blog", url: "https://v8.dev/blog/preparser" },
      {
        label: "Long Animation Frames API",
        source: "web.dev",
        url: "https://web.dev/articles/loaf-api",
      },
    ],
  },
  {
    id: "compositing",
    number: 187,
    slug: "compositing-and-the-layer-economy",
    title: "Compositing and the Layer Economy",
    field: "Browser Rendering",
    lab: "browser",
    difficulty: "RESEARCHER",
    status: "ACTIVE",
    abstract:
      "Compositor layers make animation cheap and memory expensive. This dossier documents what promotes an element to its own layer, what that buys, and where the practice of promoting everything goes wrong.",
    stats: { experiments: 9, observations: 18 },
    sections: [
      {
        heading: "Question",
        blocks: [
          {
            type: "prose",
            text: "Why can a transform animation stay at 60fps while the main thread is completely blocked, and why does adding `will-change: transform` to a list of 500 rows make the page slower?",
          },
        ],
      },
      {
        heading: "Background",
        blocks: [
          {
            type: "prose",
            text: "After paint, the page is a set of display lists. The compositor turns those into textures and assembles them into a frame. Content that lives in its own layer can be moved, scaled or faded by changing a transform matrix on the GPU, with no repaint and no main-thread involvement.",
          },
          {
            type: "table",
            head: ["Operation", "Where it runs", "Main thread needed"],
            rows: [
              ["transform / opacity on a composited layer", "Compositor thread", "No"],
              ["scroll (in the common case)", "Compositor thread", "No"],
              ["background-color change", "Main thread paint", "Yes"],
              ["width / height change", "Main thread layout + paint", "Yes"],
              ["non-passive touch/wheel listener", "Forces main-thread scroll", "Yes"],
            ],
          },
        ],
      },
      {
        heading: "Findings",
        blocks: [
          {
            type: "prose",
            text: "**Finding 1. Every layer costs memory.** A layer's texture is roughly width × height × device pixel ratio² × 4 bytes. A full-screen layer on a 3× phone is several megabytes. Hundreds of layers exhaust GPU memory and force the compositor into slower paths.",
          },
          {
            type: "prose",
            text: "**Finding 2. Promotion is not free at creation time.** Promoting an element requires a separate raster pass, and un-promoting it requires the content to be re-rastered into its parent. Toggling `will-change` on hover can cost more than the animation saves.",
          },
          {
            type: "prose",
            text: "**Finding 3. Layer explosion is usually accidental.** An element promoted for animation forces overlapping elements above it to be promoted too, so the compositor can preserve paint order. One bad promotion can cascade.",
          },
          {
            type: "prose",
            text: "**Finding 4. Scrolling is compositing.** Non-passive wheel and touch listeners force scrolling back onto the main thread, because the browser must wait to learn whether the event will be cancelled. `{ passive: true }` is the fix, and it is the default for wheel and touch listeners on the document.",
          },
        ],
      },
      {
        heading: "Method",
        blocks: [
          {
            type: "steps",
            items: [
              "Enable Layer borders and the Layers panel in Chrome DevTools.",
              "Record a trace while the animation runs; check whether frames appear on the compositor thread only.",
              "Count layers and read the reported memory before and after a change.",
              "Apply will-change immediately before the animation and remove it after, rather than declaring it statically.",
            ],
          },
          {
            type: "code",
            lang: "js",
            caption: "Promote late, demote early",
            code: `el.style.willChange = "transform";
requestAnimationFrame(() => {
 el.animate([{ transform: "translateX(0)" }, { transform: "translateX(240px)" }],
 { duration: 300, easing: "ease-out" })
 .finished.then(() => { el.style.willChange = "auto"; });
});`,
          },
        ],
      },
      {
        heading: "Limitations",
        blocks: [
          {
            type: "callout",
            variant: "model",
            title: "Engine-specific",
            text: "Layerisation heuristics are implementation details. Chromium, Gecko and WebKit each decide differently and change their decisions between versions. The stable, portable facts are: transform and opacity are the compositor-friendly properties, and layers consume memory.",
          },
        ],
      },
    ],
    references: [
      {
        label: "Stick to compositor-only properties",
        source: "web.dev",
        url: "https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count",
      },
      {
        label: "will-change",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/will-change",
      },
      {
        label: "Improving scroll performance with passive listeners",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#improving_scrolling_performance_with_passive_listeners",
      },
    ],
  },
  {
    id: "fiber",
    number: 96,
    slug: "fiber-and-the-interruptible-render",
    title: "Fiber and the Interruptible Render",
    field: "UI Architecture",
    lab: "react",
    difficulty: "RESEARCHER",
    status: "UNDER REVIEW",
    abstract:
      "Why React rewrote its reconciler around a linked list of units of work, what 'interruptible' actually means on a single thread, and which user-visible behaviours fall out of that decision.",
    stats: { experiments: 6, observations: 11 },
    sections: [
      {
        heading: "Question",
        blocks: [
          {
            type: "prose",
            text: "JavaScript runs to completion. How can a render be 'interrupted', and what is actually being interrupted?",
          },
        ],
      },
      {
        heading: "Background",
        blocks: [
          {
            type: "prose",
            text: "The pre-Fiber reconciler walked the component tree with recursion. A recursive walk cannot be paused: the state of the traversal lives on the call stack, and you cannot save a call stack. Fiber replaces recursion with an explicit data structure, a tree of fiber nodes linked by child, sibling and return pointers, so the traversal state is a value React owns rather than a stack frame the engine owns.",
          },
          {
            type: "code",
            lang: "text",
            caption: "The loop, in essence",
            code: `while (nextUnitOfWork !== null && !shouldYield()) {
 nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
}
// shouldYield() consults the scheduler and the frame deadline.
// If we yield, nextUnitOfWork is still a valid pointer to resume from.`,
          },
        ],
      },
      {
        heading: "Findings",
        blocks: [
          {
            type: "prose",
            text: "**Finding 1. Only the render phase is interruptible.** Render is where your components are called and the work-in-progress tree is built. Commit, where the DOM is mutated and layout effects run, is synchronous and atomic, because a half-applied DOM is not a state the user may ever observe.",
          },
          {
            type: "prose",
            text: "**Finding 2. Interruptible means abandonable.** A render in progress can be thrown away entirely if a higher-priority update arrives. That is why render must be pure: React may call your component twice, or discard the result, and neither may be observable.",
          },
          {
            type: "prose",
            text: "**Finding 3. Transitions are a priority signal, not a scheduler.** `startTransition` marks an update as non-urgent. It does not make the render faster; it lets an urgent update (a keystroke) pre-empt it, so typing stays responsive while an expensive list re-renders behind it.",
          },
          {
            type: "prose",
            text: "**Finding 4. Suspense is a coordination mechanism.** A component that suspends signals that its subtree is not ready. React keeps the previous UI on screen or shows a fallback, and, with streaming SSR, the server can send the rest of the document while a slow boundary is still resolving.",
          },
        ],
      },
      {
        heading: "Interpretation",
        blocks: [
          {
            type: "prose",
            text: "Everything user-visible in modern React descends from one decision: make the traversal state a value. Concurrent rendering, transitions, Suspense, selective hydration and streaming are all consequences of being able to stop halfway and resume.",
          },
          {
            type: "callout",
            variant: "warning",
            title: "The constraint this places on you",
            text: "Side effects during render are no longer merely poor style, they are a correctness bug, because the render may be discarded or repeated. StrictMode's double-invocation exists to surface exactly this.",
          },
        ],
      },
      {
        heading: "Limitations",
        blocks: [
          {
            type: "prose",
            text: "Fiber internals are not a public API and change between releases. The public contracts, purity of render, the render/commit split, the semantics of transitions and Suspense, are stable and are what this dossier relies on.",
          },
        ],
      },
    ],
    references: [
      {
        label: "React reconciler architecture",
        source: "React",
        url: "https://github.com/acdlite/react-fiber-architecture",
      },
      {
        label: "startTransition",
        source: "React docs",
        url: "https://react.dev/reference/react/startTransition",
      },
      {
        label: "Suspense",
        source: "React docs",
        url: "https://react.dev/reference/react/Suspense",
      },
    ],
  },
  {
    id: "same-origin",
    number: 231,
    slug: "the-boundary-that-holds-the-web-together",
    title: "The Boundary That Holds the Web Together",
    field: "Browser Security",
    lab: "security",
    difficulty: "RESEARCHER",
    status: "ACTIVE",
    abstract:
      "The same-origin policy is the oldest load-bearing rule on the platform, and almost every security feature added since exists either to relax it safely or to patch a place where it leaked. This dossier traces what it protects, what it never protected, and why so much of modern web security is a negotiation around one boundary.",
    stats: { experiments: 8, observations: 21 },
    sections: [
      {
        heading: "Question",
        blocks: [
          {
            type: "prose",
            text: "If the browser will happily send a cross-origin request with the user's cookies attached, in what sense is the origin a security boundary at all?",
          },
        ],
      },
      {
        heading: "Background",
        blocks: [
          {
            type: "prose",
            text: "An origin is the triple of scheme, host and port. Two documents share an origin only when all three match, and that comparison decides whether one may script the other, read its storage, or read the bytes of its responses. Everything else on the platform is layered on top of that single comparison.",
          },
          {
            type: "prose",
            text: "The policy was never a restriction on *sending*. The web is built on cross-origin embedding: images, scripts, stylesheets, iframes and form submissions all cross origins by design, and removing that would remove the web. The boundary sits at readability instead, which is a narrower and stranger guarantee than most developers assume.",
          },
          {
            type: "table",
            caption: "What the boundary does and does not cover",
            head: ["Operation", "Cross-origin"],
            rows: [
              ["Load an image, script or stylesheet", "Permitted"],
              ["Submit a form", "Permitted, and the reason CSRF exists"],
              ["Send a fetch or XHR", "Permitted"],
              ["Read the response body", "Denied unless CORS grants it"],
              ["Read a frame's DOM", "Denied"],
              ["Read localStorage or IndexedDB", "Denied"],
              [
                "Measure timing or size of a response",
                "Partly observable, and the basis of side-channel attacks",
              ],
            ],
          },
        ],
      },
      {
        heading: "Findings",
        blocks: [
          {
            type: "prose",
            text: "**Finding 1. CORS relaxes the policy, it does not impose it.** Developers routinely describe CORS as the thing blocking them. The block predates CORS by a decade; CORS is the server's mechanism for lifting it for named origins.",
          },
          {
            type: "prose",
            text: "**Finding 2. Cookies are a second, older axis.** Ambient authority means a request carries credentials regardless of who initiated it. `SameSite` retrofits intent onto that model, and the ongoing removal of third-party cookies is the platform conceding that the original design cannot be secured by policy alone.",
          },
          {
            type: "prose",
            text: "**Finding 3. Embedding leaked more than anyone planned.** Response sizes, load timings, and error behaviour are all observable across origins, which is why Cross-Origin Read Blocking, Cross-Origin-Resource-Policy and cross-origin isolation exist. Spectre turned a theoretical side channel into a reason to re-architect process isolation.",
          },
          {
            type: "prose",
            text: "**Finding 4. Most real breaches sidestep the boundary entirely.** Cross-site scripting wins because injected code runs *inside* the origin, where the policy grants it everything. This is why Content-Security-Policy, trusted types and output encoding matter more to most applications than any CORS configuration.",
          },
        ],
      },
      {
        heading: "Interpretation",
        blocks: [
          {
            type: "prose",
            text: "The useful mental model is not a wall but a membrane: things pass through it constantly, and the rule governs what may be observed on the far side. Security work on the web is mostly about who is allowed to run code inside a given origin, and what that code can then reach.",
          },
          {
            type: "callout",
            variant: "warning",
            title: "Practical consequence",
            text: "Disabling a CORS check in development, or reflecting the request's Origin header back unconditionally with credentials enabled, converts a boundary into a doorway. Reflectors are the most common self-inflicted CORS vulnerability.",
          },
        ],
      },
      {
        heading: "Limitations",
        blocks: [
          {
            type: "prose",
            text: "This dossier describes the model, not any particular implementation. Browsers differ in their heuristics for private network access, opaque responses and storage partitioning, and the third-party cookie timeline has moved repeatedly. Treat the mechanism as stable and the specifics as perishable.",
          },
        ],
      },
    ],
    references: [
      {
        label: "Same-origin policy",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy",
      },
      { label: "Fetch Standard", source: "WHATWG", url: "https://fetch.spec.whatwg.org/" },
      {
        label: "Post-Spectre web development",
        source: "W3C",
        url: "https://www.w3.org/TR/post-spectre-webdev/",
      },
    ],
  },
  {
    id: "cost-models",
    number: 118,
    slug: "cost-models-for-interface-work",
    title: "Cost Models for Interface Work",
    field: "Applied Complexity",
    lab: "algorithms",
    difficulty: "RESEARCHER",
    status: "ACTIVE",
    abstract:
      "Big-O answers how cost grows, which is rarely the question a frontend engineer is actually asking. This dossier assembles the cost models that predict interface performance: per-frame budgets, allocation pressure, DOM size, and the constant factors that decide which algorithm wins at the sizes real applications use.",
    stats: { experiments: 11, observations: 19 },
    sections: [
      {
        heading: "Question",
        blocks: [
          {
            type: "prose",
            text: "Why do interfaces written with textbook-optimal algorithms still drop frames, and why does the naive implementation often win below a few hundred items?",
          },
        ],
      },
      {
        heading: "Background",
        blocks: [
          {
            type: "prose",
            text: "Asymptotic complexity deliberately discards constants. That is the right abstraction for comparing algorithms at unbounded size and the wrong one for a list of three hundred rows rendered sixty times a second, where the constant factor is the entire story.",
          },
          {
            type: "table",
            caption: "Four cost models, and what each one predicts",
            head: ["Model", "Predicts", "Unit"],
            rows: [
              ["Asymptotic", "Scaling behaviour", "operations as n grows"],
              ["Frame budget", "Whether a frame ships", "milliseconds out of 16.7"],
              ["Allocation", "Collector pressure and jank", "objects surviving a scavenge"],
              ["DOM size", "Style, layout and memory cost", "nodes and depth"],
            ],
          },
        ],
      },
      {
        heading: "Findings",
        blocks: [
          {
            type: "prose",
            text: "**Finding 1. The crossover point is usually higher than expected.** Linear scans over small contiguous arrays are extremely cache friendly. A `Map` wins decisively at scale and can lose at a handful of items, so the honest answer to which is faster is a measurement, not a table.",
          },
          {
            type: "prose",
            text: "**Finding 2. Quadratic work hides inside linear-looking code.** A lookup inside a render, a filter inside a map, a deduplication that compares every pair: each reads as one loop and behaves as two.",
          },
          {
            type: "prose",
            text: "**Finding 3. The DOM has its own exponent.** Rendering n rows costs style resolution, layout and memory per node regardless of how efficiently the data was prepared. Virtualisation changes that term; a better algorithm does not.",
          },
          {
            type: "prose",
            text: "**Finding 4. Frame budget is a hard constraint, not an average.** A 12ms mean with a 40ms tail produces visible stutter. Interface performance is governed by the worst frames, which makes percentiles the only honest summary.",
          },
        ],
      },
      {
        heading: "Method",
        blocks: [
          {
            type: "steps",
            items: [
              "Measure at the sizes your application actually reaches, not at the size that makes the graph dramatic.",
              "Throttle the CPU. An algorithm that fits the budget on a workstation may not on a mid-range phone.",
              "Separate build cost from query cost. Indexing once and reading many times is a different profile from doing both in a loop.",
              "Record the distribution, not the mean, and treat the long tail as the result.",
            ],
          },
        ],
      },
      {
        heading: "Limitations",
        blocks: [
          {
            type: "callout",
            variant: "model",
            title: "Engine dependent",
            text: "Hidden classes, inline caches and the JIT's tiering all affect constants, and all of them change between engine releases. Measurements age; the method of measuring does not.",
          },
        ],
      },
    ],
    references: [
      {
        label: "Optimize long tasks",
        source: "web.dev",
        url: "https://web.dev/articles/optimize-long-tasks",
      },
      {
        label: "Rendering performance",
        source: "web.dev",
        url: "https://web.dev/articles/rendering-performance",
      },
      {
        label: "Trash talk, the Orinoco garbage collector",
        source: "V8 blog",
        url: "https://v8.dev/blog/trash-talk",
      },
    ],
  },
];
