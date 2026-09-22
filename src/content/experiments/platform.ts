import type { Experiment } from "../types";

export const PLATFORM_EXPERIMENTS: Experiment[] = [
  {
    id: "origin-boundary",
    number: 19,
    slug: "why-the-browser-blocked-that-fetch",
    title: "Why did the browser block that fetch?",
    lab: "security",
    difficulty: "SYSTEMS",
    estimatedMinutes: 11,
    type: "INTERACTIVE",
    summary:
      "The network tab shows a 200. Your code sees an error. Both are correct, and the difference is the whole security model.",
    question:
      "A cross-origin `fetch` returns a CORS error in the console, yet the server logged the request and returned data. What exactly did the browser stop?",
    hypothesis:
      "The same-origin policy restricts what a document may *read*, not what it may send. The request was made; the response was withheld from your script.",
    concepts: ["same-origin policy", "CORS", "credentials", "SameSite", "origin"],
    prerequisites: ["Comfortable reading a network panel"],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "Pick a target, then change what the server sends back and what the request asks for. The bench reports which operations the browser permits and why.",
        },
        { type: "sim", sim: "same-origin", caption: "Origin boundary bench" },
      ],
      observation: [
        {
          type: "prose",
          text: "Sending is always allowed. Reading almost never is, unless the server explicitly opts the caller in. That asymmetry is deliberate: the browser cannot know whether a request is harmful, but it can stop one site from harvesting another site's responses.",
        },
        {
          type: "callout",
          variant: "fact",
          text: "An origin is the triple of scheme, host and port. `https://app.example.com` and `https://api.example.com` are different origins, and so are `http://` and `https://` versions of the same host, and the same host on a different port.",
        },
        {
          type: "table",
          caption: "Site and origin are different units",
          head: ["Pair", "Same origin", "Same site"],
          rows: [
            ["https://a.example.com and https://a.example.com", "yes", "yes"],
            ["https://a.example.com and https://b.example.com", "no", "yes"],
            ["https://example.com and http://example.com", "no", "no (scheme counts)"],
            ["https://example.com and https://example.com:8443", "no", "yes"],
            ["https://example.com and https://partner.test", "no", "no"],
          ],
        },
      ],
      explanation: [
        {
          type: "prose",
          text: "CORS is not a restriction added on top of the web. It is the mechanism that *relaxes* an older restriction. Before it existed, a cross-origin response was simply unreadable; CORS gives the server a way to say which origins may read what.",
        },
        {
          type: "code",
          lang: "http",
          filename: "response.http",
          highlight: [4, 5],
          caption: "The server, not the client, grants access",
          code: `HTTP/1.1 200 OK
Content-Type: application/json

Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
Vary: Origin`,
        },
        {
          type: "prose",
          text: "A preflight appears when the request is not simple: a method other than GET, HEAD or POST, a `Content-Type` outside the three form-ish values, or custom headers. The browser sends `OPTIONS` first and refuses to send the real request until the server approves it.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "A blocked read is not a blocked side effect",
          text: "A cross-origin POST that the browser refuses to let you read has still reached the server and may have changed state. That is precisely why CSRF protection exists and why `SameSite` cookies matter.",
        },
        {
          type: "why",
          question: "Why can a page load an image from anywhere but not read a JSON response?",
          chain: {
            answer:
              "Because embedding a resource and reading its bytes are different capabilities.",
            next: {
              answer:
                "The web has always allowed embedding: images, scripts, stylesheets and frames load cross-origin by design, which is what makes the web composable.",
              next: {
                answer:
                  "Reading is different. If a script could read any response, a malicious page could fetch your bank's account page with your cookies attached and exfiltrate it.",
                next: {
                  answer:
                    "So the boundary sits at readability. Embed freely, read only with permission. Features such as CORB, CORP and Cross-Origin-Isolation exist to close the gaps where embedding leaked readable data anyway.",
                },
              },
            },
          },
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "Cookies have their own axis. `SameSite=Lax` is the modern default and withholds cookies on cross-site subresource requests while still sending them on top-level navigations. `SameSite=None` restores the old behaviour but requires `Secure`, and is increasingly restricted by browsers phasing out third-party cookies.",
        },
        {
          type: "callout",
          variant: "model",
          title: "Educational model",
          text: "This bench models the decisions, not the full algorithm. Real checks also involve preflight caching, opaque responses, redirects, CORP and COEP headers, and per-browser heuristics for private network access.",
        },
      ],
    },
    references: [
      {
        label: "Same-origin policy",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy",
      },
      {
        label: "Fetch Standard, CORS protocol",
        source: "WHATWG",
        url: "https://fetch.spec.whatwg.org/#http-cors-protocol",
      },
      {
        label: "SameSite cookies explained",
        source: "web.dev",
        url: "https://web.dev/articles/samesite-cookies-explained",
      },
    ],
    related: ["network-distance", "url-journey"],
  },
  {
    id: "lookup-cost",
    number: 20,
    slug: "why-this-list-gets-slower",
    title: "Why does this list get slower as it grows?",
    lab: "algorithms",
    difficulty: "ENGINEER",
    estimatedMinutes: 9,
    type: "MEASUREMENT",
    summary:
      "A table that is instant with fifty rows crawls with five thousand. Nothing about the code changed, only the value of n.",
    question:
      "Why does a lookup written inside a render loop turn a linear list into a quadratic one, and when does that actually matter in a browser?",
    hypothesis:
      "A lookup that scans the array is O(n). Performing it once per row makes the whole render O(n²). Indexing the data once turns the per-row cost into a constant.",
    concepts: ["complexity", "hash maps", "render cost", "measurement"],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "The bench builds real arrays at the size you choose and runs each strategy on your device. The timings are measurements, not estimates.",
        },
        { type: "sim", sim: "complexity", caption: "Lookup cost bench, runs real work" },
      ],
      observation: [
        {
          type: "prose",
          text: "At small n every strategy looks fine, which is exactly why the problem ships. The scan and the index separate as n grows, and the pairwise comparison leaves the frame budget long before the others are noticeable.",
        },
        {
          type: "code",
          lang: "jsx",
          filename: "Table.jsx",
          highlight: [3],
          caption: "The quadratic render, written innocently",
          code: `{rows.map((row) => {
  // runs once per row, and scans every user each time
  const owner = users.find((user) => user.id === row.ownerId);
  return <Row key={row.id} row={row} owner={owner} />;
})}`,
        },
        {
          type: "code",
          lang: "jsx",
          filename: "Table.jsx",
          caption: "One pass to index, constant time per row",
          code: `const usersById = useMemo(
  () => new Map(users.map((user) => [user.id, user])),
  [users],
);

{rows.map((row) => (
  <Row key={row.id} row={row} owner={usersById.get(row.ownerId)} />
))}`,
        },
      ],
      explanation: [
        {
          type: "prose",
          text: "Complexity describes how cost grows, not how large it is. O(n²) with a tiny constant can beat O(n) with an expensive one at realistic sizes, which is why an array scan wins for a handful of items and loses badly at a thousand.",
        },
        {
          type: "table",
          caption: "Rough operation counts, 400 lookups",
          head: ["n", "Array scan", "Map lookups"],
          rows: [
            ["100", "~20,000", "~500"],
            ["1,000", "~200,000", "~1,400"],
            ["10,000", "~2,000,000", "~10,400"],
          ],
        },
        {
          type: "callout",
          variant: "fact",
          text: "A `Map` lookup is amortised O(1), but building the map is O(n). Index once outside the loop, not inside it, or you have simply paid for both algorithms.",
        },
        {
          type: "callout",
          variant: "note",
          title: "The browser adds its own terms",
          text: "Rendering n rows is also O(n) in DOM nodes, style resolution and layout. Fixing the lookup removes one factor; virtualising the list removes the other.",
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "Measure before rewriting. The profiler tells you which term dominates: a flat profile across thousands of small calls points at the algorithm, while a single long call points at one expensive operation. Optimising the wrong term is how a codebase accumulates clever code that changes nothing.",
        },
      ],
    },
    references: [
      {
        label: "Map",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map",
      },
      {
        label: "Virtualize large lists",
        source: "web.dev",
        url: "https://web.dev/articles/virtualize-long-lists-react-window",
      },
    ],
    related: ["main-thread", "why-render"],
  },
  {
    id: "barrel-cost",
    number: 21,
    slug: "what-a-barrel-file-costs",
    title: "What does a barrel file cost?",
    lab: "architecture",
    difficulty: "SYSTEMS",
    estimatedMinutes: 8,
    type: "INVESTIGATION",
    summary:
      "One tidy index.ts, one import, and suddenly the route bundle contains a charting library nobody on that page uses.",
    question:
      "Why does importing a single helper from a barrel file sometimes pull in an entire package, and why does tree shaking not save you?",
    hypothesis:
      "A barrel re-exports every module in a directory. Unless every one of those modules is provably free of side effects, the bundler must keep them.",
    concepts: ["barrel files", "tree shaking", "side effects", "module graph", "bundling"],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "Add packages to the graph and watch the transitive closure and the shipped estimate move. The same mechanics apply inside your own source tree.",
        },
        { type: "sim", sim: "dependency-graph", caption: "Dependency observatory" },
      ],
      observation: [
        {
          type: "code",
          lang: "ts",
          filename: "components/index.ts",
          caption: "The convenient version",
          code: `export * from "./Button";
export * from "./Chart";        // pulls in the charting library
export * from "./DatePicker";   // pulls in the date library
export * from "./Table";`,
        },
        {
          type: "prose",
          text: "Importing `Button` from that barrel asks the bundler to evaluate the whole module graph behind it. With clean ESM and no side effects it can drop the unused branches. One `sideEffects` omission, one CommonJS dependency or one module-scope registration is enough to keep everything.",
        },
      ],
      explanation: [
        {
          type: "steps",
          title: "What keeps a module alive",
          items: [
            'The package does not declare `"sideEffects": false`, so the bundler must assume importing it does something observable.',
            "A module runs code at import time: registering a web component, polyfilling, mutating a prototype, reading configuration.",
            "The dependency is CommonJS, so its exports cannot be analysed statically.",
            "A namespace import is indexed dynamically, which defeats static analysis.",
          ],
        },
        {
          type: "callout",
          variant: "warning",
          title: "The cost is not only bytes",
          text: "Barrels also lengthen the module graph, which slows cold dev server starts and HMR, and they make circular imports far easier to create by accident.",
        },
        {
          type: "prose",
          text: "The fix is boring: import from the module, not from the directory. Keep barrels for genuinely small, side-effect-free groups, and let the build measure the difference rather than trusting that tree shaking will handle it.",
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "Check the claim rather than the convention. A bundle analyser will tell you which modules a route actually contains, and comparing two builds, one importing through the barrel and one importing directly, settles the argument in about ten minutes.",
        },
      ],
    },
    references: [
      {
        label: "Tree shaking",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking",
      },
      {
        label: "sideEffects",
        source: "webpack",
        url: "https://webpack.js.org/guides/tree-shaking/",
      },
      {
        label: "Package entry points",
        source: "Node.js",
        url: "https://nodejs.org/api/packages.html#package-entry-points",
      },
    ],
    related: ["dependency-weight", "perf-rescue"],
  },
  {
    id: "focus-order",
    number: 22,
    slug: "focus-order-is-not-dom-order",
    title: "When focus order stops matching the page",
    lab: "accessibility",
    difficulty: "ENGINEER",
    estimatedMinutes: 8,
    type: "INTERACTIVE",
    summary:
      "The layout reads left to right. The Tab key does something else entirely, and CSS is the reason.",
    question:
      "Why can a visually ordered row of controls be traversed in a different order by the keyboard, and what actually determines the sequence?",
    hypothesis:
      "Sequential focus follows the DOM, not the visual layout. Any CSS that reorders boxes without reordering nodes, such as `order`, `row-reverse` or grid placement, separates the two.",
    concepts: ["focus order", "tabindex", "flex order", "accessibility tree", "keyboard"],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "Change the markup and watch the accessibility tree recompute. Role, name and focusability are derived from what you wrote, not from what you styled.",
        },
        { type: "sim", sim: "a11y-tree", caption: "Accessibility tree bench" },
      ],
      observation: [
        {
          type: "callout",
          variant: "fact",
          text: "Sequential focus navigation follows document order. CSS `order`, `flex-direction: row-reverse`, `grid-auto-flow` and absolute positioning move the boxes; none of them move the nodes.",
        },
        {
          type: "code",
          lang: "css",
          filename: "toolbar.css",
          highlight: [2, 6],
          caption: "Visually first, still last in the tab sequence",
          code: `.toolbar {
  display: flex;
  flex-direction: row-reverse;
}

.toolbar .primary { order: -1; }`,
        },
      ],
      explanation: [
        {
          type: "prose",
          text: "A keyboard user experiences the order you wrote; a sighted mouse user experiences the order you styled. When the two disagree, focus appears to jump across the screen, and a user relying on a screen magnifier can lose the caret entirely.",
        },
        {
          type: "table",
          head: ["Value", "Effect"],
          rows: [
            ['tabindex="0"', "Adds the element to the sequence in document order"],
            ['tabindex="-1"', "Focusable by script only, which is correct for a dialog container"],
            ['tabindex="1" or higher', "Jumps ahead of everything else. Almost always a bug"],
            ["CSS order / reverse", "Moves the box, never the focus position"],
          ],
        },
        {
          type: "callout",
          variant: "warning",
          title: "Positive tabindex is a trap",
          text: "Any element with a positive tabindex is visited before every element with 0, across the entire document. One such value reorders the whole page.",
        },
        {
          type: "prose",
          text: "The remedy is to fix the source order and let CSS follow it. If the design truly needs a different reading order, that is a signal to restructure the markup rather than to reach for tabindex.",
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "Test it the way it will be used. Tab through the page from the address bar, watch where the focus ring goes, and confirm that it never disappears, never jumps backwards, and always returns somewhere sensible after a dialog closes.",
        },
      ],
    },
    references: [
      {
        label: "Focus order, Understanding WCAG 2.4.3",
        source: "W3C",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html",
      },
      {
        label: "tabindex",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex",
      },
      {
        label: "CSS order and reading order",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Ordering_flex_items",
      },
    ],
    related: ["invisible-dom", "render-invalidation"],
  },
];
