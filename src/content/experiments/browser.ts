import type { Experiment } from "../types";

export const BROWSER_EXPERIMENTS: Experiment[] = [
  {
    id: "url-journey",
    number: 9,
    slug: "what-happens-when-you-load-a-url",
    title: "What happens when you load a URL?",
    lab: "browser",
    difficulty: "ENGINEER",
    estimatedMinutes: 14,
    type: "SIMULATION",
    summary:
      "The interview question, run as an actual experiment: every hop, with a stopwatch on it.",
    question:
      "Between pressing Enter and seeing content, how much of the delay is network, how much is the server, and how much is your own JavaScript?",
    hypothesis:
      "On a typical connection the first paint is dominated by round trips, not by bandwidth, and the interactive delay is dominated by script execution, not by transfer.",
    concepts: ["DNS", "TCP", "TLS", "TTFB", "critical rendering path", "round trips"],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "Set the distance to the server, the protocol and the cache state. The bench animates each packet and reports the time budget of every phase.",
        },
        { type: "sim", sim: "url-journey", caption: "Request journey bench. LAB-01 / LAB-06" },
        {
          type: "steps",
          title: "Protocol",
          items: [
            "Start on a cold cache, HTTP/1.1, server on another continent. Note the total.",
            "Switch to HTTP/2 and watch what changes, and what does not.",
            "Move the server to an edge location 20ms away. Compare the handshake cost.",
            "Enable a warm connection and observe how many round trips disappear.",
          ],
        },
      ],
      observation: [
        {
          type: "table",
          caption: "Round trips before the first byte of HTML (cold connection)",
          head: ["Phase", "Round trips", "Notes"],
          rows: [
            ["DNS", "0 to 2", "Often cached at the OS or resolver"],
            ["TCP handshake", "1", "SYN → SYN-ACK → ACK"],
            ["TLS 1.3 handshake", "1", "TLS 1.2 needed 2; 0-RTT resumption can reach 0"],
            ["QUIC (HTTP/3) first connection", "1", "Transport and crypto handshake are combined"],
            ["HTTP request → first byte", "1", "Plus server think time"],
          ],
        },
        {
          type: "prose",
          text: "At 150ms of latency, three round trips are 450ms spent before the server has even read your request line. This is why the single most effective 'performance optimisation' is often moving the origin closer, not shrinking the payload.",
        },
      ],
      explanation: [
        {
          type: "steps",
          title: "The journey",
          items: [
            "URL parsing and scheme handling; HSTS may upgrade http:// to https:// with no network at all.",
            "DNS resolution: OS cache → resolver → recursive lookup.",
            "TCP (or QUIC) connection established to the resolved address.",
            "TLS handshake: certificate verification, key agreement, ALPN negotiates the HTTP version.",
            "The request is sent; the server responds with headers, then the HTML body.",
            "The HTML parser starts building the DOM incrementally as bytes arrive.",
            "Subresources are discovered, the preload scanner fetches them ahead of the parser.",
            "Render-blocking CSS must arrive and be parsed before the first paint.",
            "Scripts execute, hydration runs, and the page becomes interactive.",
          ],
        },
        {
          type: "callout",
          variant: "fact",
          title: "Documented fact",
          text: 'A classic `<script src>` in the head blocks the parser at that point. `defer` keeps parsing and runs in order before DOMContentLoaded; `async` runs whenever it arrives, out of order. `type="module"` behaves like `defer` by default.',
        },
        {
          type: "code",
          lang: "html",
          caption: "Four very different loading behaviours",
          code: `<script src="a.js"></script> <!-- blocks the parser -->
<script src="b.js" defer></script> <!-- parse continues, runs in order -->
<script src="c.js" async></script> <!-- parse continues, runs ASAP -->
<script src="d.js" type="module"></script><!-- deferred by default -->`,
        },
        {
          type: "prose",
          text: "CSS is render-blocking but not parser-blocking, except that a script cannot run until pending stylesheets have loaded, because a script may read computed styles. That coupling is why a slow stylesheet can delay a script that has nothing to do with it.",
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "TCP slow start means bandwidth is not available immediately. A new connection begins with a congestion window of roughly 10 segments (~14KB) and doubles each round trip. That is the real reason for the 'first 14KB' rule of thumb: whatever fits in the first flight arrives one round trip sooner than everything else.",
        },
        {
          type: "callout",
          variant: "model",
          title: "Simplified model",
          text: "The bench treats latency as constant and bandwidth as smooth. Real networks have jitter, packet loss, buffer bloat and radio wake-up costs on mobile, all of which make the measured numbers worse than the model, never better.",
        },
      ],
    },
    references: [
      {
        label: "Populating the page: how browsers work",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work",
      },
      {
        label: "Critical rendering path",
        source: "web.dev",
        url: "https://web.dev/learn/performance/understanding-the-critical-path",
      },
      {
        label: "HTTP/3 explained",
        source: "IETF / QUIC WG",
        url: "https://datatracker.ietf.org/doc/html/rfc9114",
      },
    ],
    related: ["render-invalidation", "network-distance", "perf-rescue"],
  },
  {
    id: "render-invalidation",
    number: 10,
    slug: "rendering-pipeline-investigation",
    title: "Rendering pipeline investigation",
    lab: "browser",
    difficulty: "RESEARCHER",
    estimatedMinutes: 11,
    type: "SIMULATION",
    summary:
      "Change one property. Watch exactly which stages of the pipeline are invalidated, and which are not.",
    question:
      "Why is animating `transform` cheap while animating `top` is expensive, when both move the element by the same number of pixels?",
    hypothesis:
      "Different properties invalidate different stages. `top` forces layout for a subtree; `transform` can be handled by the compositor without touching layout or paint at all.",
    concepts: ["style", "layout", "paint", "compositing", "invalidation", "frame budget"],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "Pick a property to mutate. The bench lights up the pipeline stages that must re-run and estimates the per-frame cost.",
        },
        { type: "sim", sim: "render-pipeline", caption: "Pipeline invalidation bench. LAB-01" },
      ],
      observation: [
        {
          type: "table",
          caption: "Invalidation by property (Chromium behaviour; other engines differ in detail)",
          head: ["Property", "Style", "Layout", "Paint", "Composite"],
          rows: [
            ["width / height / top / margin", "yes", "yes", "yes", "yes"],
            ["font-size", "yes", "yes", "yes", "yes"],
            ["color / background-color", "yes", "no", "yes", "yes"],
            ["box-shadow / border-radius", "yes", "no", "yes", "yes"],
            ["transform", "yes", "no", "no", "yes"],
            ["opacity", "yes", "no", "no", "yes"],
            ["filter", "yes", "no", "no", "yes"],
            ["scroll position", "no", "no", "no", "yes"],
          ],
        },
        {
          type: "callout",
          variant: "fact",
          title: "Documented fact",
          text: "`transform` and `opacity` are the two properties that can be animated entirely on the compositor thread, which means they keep moving even while the main thread is busy. Everything else stalls when JavaScript stalls.",
        },
      ],
      explanation: [
        {
          type: "steps",
          title: "The pipeline",
          items: [
            "Parse: HTML → DOM, CSS → CSSOM.",
            "Style: match selectors and compute the used value of every property for every element.",
            "Layout: compute geometry, position and size of every box.",
            "Pre-paint / paint: record a display list of draw commands per layer.",
            "Raster: turn the display list into pixels, often on the GPU, often in tiles.",
            "Composite: assemble layers into a frame and hand it to the display.",
          ],
        },
        {
          type: "prose",
          text: "Layout is the expensive stage because it is not local: changing one box can move its siblings, its parent's height, and everything after it in flow. Modern engines invalidate subtrees rather than the whole document, and `contain: layout` lets you promise that a subtree's layout cannot affect the outside, turning a document-wide invalidation into a local one.",
        },
        {
          type: "code",
          lang: "js",
          caption: "Layout thrashing: the same work, 100× more expensive",
          code: `// Bad: every read after a write forces a synchronous layout
for (const el of items) {
 el.style.height = el.offsetHeight + 10 + "px";
}

// Better: batch reads, then batch writes
const heights = items.map((el) => el.offsetHeight);
items.forEach((el, i) => {
 el.style.height = heights[i] + 10 + "px";
});`,
        },
        {
          type: "why",
          question: "Why does reading offsetHeight force layout?",
          chain: {
            answer: "Because it must return a number that is correct *right now*.",
            next: {
              answer:
                "Style and layout are normally batched until the next rendering opportunity, so pending changes have not been applied yet.",
              next: {
                answer:
                  "To answer the question truthfully, the engine flushes those pending changes, a forced synchronous layout, sometimes called a reflow.",
                next: {
                  answer:
                    "Doing that inside a loop alternates invalidate → flush → invalidate → flush, which is why layout thrashing turns a linear operation into a quadratic one.",
                },
              },
            },
          },
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "A 60Hz display gives roughly 16.7ms per frame, and the browser needs part of that for its own work, the common guidance is to keep main-thread work per frame under ~10ms. Miss it and you do not get a slightly late frame: you get no frame, and the previous one stays on screen for another 16.7ms.",
        },
        {
          type: "callout",
          variant: "model",
          title: "Simplified model",
          text: "The stage table is an educational model of Chromium's pipeline. Gecko and WebKit organise the same conceptual work differently, and Chromium itself changes: LayoutNG and the compositing decisions around it have been rewritten more than once.",
        },
      ],
    },
    references: [
      {
        label: "Life of a pixel",
        source: "Chromium",
        url: "https://source.chromium.org/chromium/chromium/src/+/main:docs/",
      },
      {
        label: "Rendering performance",
        source: "web.dev",
        url: "https://web.dev/articles/rendering-performance",
      },
      {
        label: "Avoid large, complex layouts and layout thrashing",
        source: "web.dev",
        url: "https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing",
      },
    ],
    related: ["url-journey", "main-thread", "stacking-creators"],
  },
];
