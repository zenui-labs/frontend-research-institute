import type { Experiment } from "../types";

export const SYSTEMS_EXPERIMENTS: Experiment[] = [
  {
    id: "network-distance",
    number: 16,
    slug: "why-a-fast-network-still-feels-slow",
    title: "Why does a fast network still feel slow?",
    lab: "networking",
    difficulty: "SYSTEMS",
    estimatedMinutes: 12,
    type: "SIMULATION",
    summary:
      "Bandwidth doubled. Nothing got faster. The variable you changed was not the one that mattered.",
    question:
      "Upgrading from 10Mbps to 100Mbps barely improves page load, but halving latency transforms it. Why is the web latency-bound?",
    hypothesis:
      "A page load is a dependency chain of round trips. Bandwidth shortens the transfer of each response; latency multiplies with the number of sequential requests, and most pages have plenty of those.",
    concepts: [
      "latency",
      "bandwidth",
      "round trips",
      "head-of-line blocking",
      "multiplexing",
      "CDN",
    ],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "Adjust latency, bandwidth, packet loss, protocol and server distance independently. Watch which slider actually moves the finish line.",
        },
        { type: "sim", sim: "network-lab", caption: "Network simulator. LAB-06" },
        {
          type: "steps",
          title: "Protocol",
          items: [
            "Fix latency at 150ms and raise bandwidth from 5 to 100Mbps. Record the change in total time.",
            "Reset bandwidth to 5Mbps and drop latency to 20ms. Record again.",
            "Switch HTTP/1.1 → HTTP/2 with many small assets and watch connection reuse.",
            "Introduce 2% packet loss and compare HTTP/2 with HTTP/3.",
          ],
        },
      ],
      observation: [
        {
          type: "prose",
          text: "Bandwidth has diminishing returns almost immediately. Latency is linear in the number of sequential round trips, and a page with a dependency chain. HTML → CSS → font → image, pays it several times over.",
        },
        {
          type: "callout",
          variant: "fact",
          title: "Documented fact",
          text: "HTTP/1.1 permits ~6 parallel connections per origin and no multiplexing, so the 7th request waits. HTTP/2 multiplexes many streams over one connection, removing that queue, but a lost TCP packet stalls *every* stream on that connection, because TCP delivers bytes in order.",
        },
      ],
      explanation: [
        {
          type: "table",
          caption: "Protocol behaviour under load",
          head: ["", "HTTP/1.1", "HTTP/2", "HTTP/3"],
          rows: [
            ["Transport", "TCP", "TCP", "QUIC over UDP"],
            [
              "Multiplexing",
              "No, 6 connections per origin",
              "Yes, one connection",
              "Yes, one connection",
            ],
            [
              "Head-of-line blocking",
              "At the request level",
              "At the TCP level on loss",
              "Per-stream only",
            ],
            ["Header compression", "None", "HPACK", "QPACK"],
            [
              "Handshake to first byte",
              "TCP + TLS (2 to 3 RTT)",
              "TCP + TLS (2 to 3 RTT)",
              "1 RTT, 0-RTT on resumption",
            ],
            ["Connection migration", "No", "No", "Yes, survives a network change"],
          ],
        },
        {
          type: "prose",
          text: "HTTP/3 does not make a healthy network faster. It makes a *lossy* network dramatically less bad, because each stream recovers independently instead of waiting behind one missing TCP segment. On mobile networks, that is most of the value.",
        },
        {
          type: "why",
          question: "Why doesn't more bandwidth fix page load?",
          chain: {
            answer:
              "Because most requests are small, and small transfers are dominated by the round trip, not the throughput.",
            next: {
              answer:
                "TCP slow start also means a new connection cannot use the available bandwidth immediately, it has to probe for it over several round trips.",
              next: {
                answer:
                  "And requests are discovered progressively: the browser cannot fetch a font it has not yet parsed a stylesheet to learn about.",
                next: {
                  answer:
                    "So page load is a critical *path* problem. Shorten the chain (preload, inline critical CSS, fewer origins), or shorten each link (edge delivery). Widening the pipe helps only the few large transfers.",
                },
              },
            },
          },
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "A CDN is usually described as a cache; its more important property is terminating the TLS handshake near the user. Even for a fully dynamic, uncacheable response, the three handshake round trips happen over 20ms instead of 150ms, and only the final origin fetch pays the long distance, over an already-warm connection.",
        },
        {
          type: "callout",
          variant: "model",
          title: "Simplified model",
          text: "The simulator models latency, bandwidth, loss and protocol behaviour as an educational approximation. It does not model congestion control, buffer bloat, radio wake-up on cellular, or middlebox interference, all of which are real and all of which make things worse.",
        },
      ],
    },
    references: [
      { label: "HTTP/3", source: "RFC 9114", url: "https://datatracker.ietf.org/doc/html/rfc9114" },
      {
        label: "Evolution of HTTP",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP",
      },
      {
        label: "Latency: the new web performance bottleneck",
        source: "Ilya Grigorik",
        url: "https://hpbn.co/primer-on-latency-and-bandwidth/",
      },
    ],
    related: ["url-journey", "perf-rescue"],
  },
  {
    id: "invisible-dom",
    number: 17,
    slug: "the-invisible-dom",
    title: "The invisible DOM",
    lab: "accessibility",
    difficulty: "ENGINEER",
    estimatedMinutes: 10,
    type: "INTERACTIVE",
    summary: "There are two trees. You wrote one of them. Assistive technology reads the other.",
    question:
      "A `div` with a click handler looks and behaves like a button on screen. What exactly is missing, and where does that difference live?",
    hypothesis:
      "The browser derives an accessibility tree from the DOM. Native elements contribute a role, a name, states and built-in keyboard behaviour; a styled div contributes a generic node with none of those.",
    concepts: ["accessibility tree", "role", "accessible name", "focus order", "ARIA"],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "Edit the markup on the left. The accessibility tree on the right is recomputed with the role, accessible name and state that assistive technology would actually receive.",
        },
        { type: "sim", sim: "a11y-tree", caption: "Accessibility tree bench. LAB-08" },
      ],
      observation: [
        {
          type: "table",
          caption: "What a native control gives you for free",
          head: ["Capability", "<button>", "<div onclick>"],
          rows: [
            ["Role announced", "button", "generic"],
            ["Reachable by Tab", "yes", 'no (needs tabindex="0")'],
            ["Enter and Space activate it", "yes", "no (needs a keydown handler)"],
            ["Disabled state honoured", "yes", "no"],
            ["Participates in a form", "yes", "no"],
            ["Exposed to voice control by name", "yes", "only with an explicit name"],
            ["Shows in the browser's find-and-click tooling", "yes", "unreliable"],
          ],
        },
        {
          type: "callout",
          variant: "fact",
          title: "Documented fact",
          text: "An accessible name is computed by an algorithm with a defined precedence: aria-labelledby, then aria-label, then native markup (a <label>, alt text, or the element's own text content), then title as a last resort. Two of those are invisible on screen, which is how names silently go missing.",
        },
      ],
      explanation: [
        {
          type: "code",
          lang: "html",
          caption: "The same control, three ways",
          code: `<!-- Correct: role, focus, keyboard, disabled all included -->
<button type="button" onclick="save()">Save</button>

<!-- Recoverable, but you now own the keyboard contract -->
<div role="button" tabindex="0"
 onclick="save()"
 onkeydown="if (event.key === 'Enter' || event.key === ' ') save()">Save</div>

<!-- Invisible to keyboard and assistive technology -->
<div class="btn" onclick="save()">Save</div>`,
        },
        {
          type: "prose",
          text: "Visual hiding has three distinct meanings and people routinely pick the wrong one. `display: none` and `visibility: hidden` remove the node from the accessibility tree. `opacity: 0` and `clip-path` do not, the content stays announced and focusable, which is how invisible focus traps happen. A visually-hidden utility class is the correct tool for text intended only for screen readers.",
        },
        {
          type: "code",
          lang: "css",
          caption: "The standard visually-hidden utility",
          code: `.visually-hidden {
 position: absolute;
 width: 1px; height: 1px;
 margin: -1px; padding: 0;
 overflow: hidden;
 clip-path: inset(50%);
 white-space: nowrap;
 border: 0;
}`,
        },
        {
          type: "callout",
          variant: "note",
          title: "First rule of ARIA",
          text: 'Do not use ARIA if a native element with the semantics you need exists. ARIA changes what is announced; it never adds behaviour. `role="button"` on a div does not make Enter work.',
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "The accessibility tree is not a copy of the DOM. Presentational nodes are pruned, anonymous boxes are ignored, and generated content may or may not appear. Browsers expose it through platform APIs. UIA on Windows, AX on macOS, AT-SPI on Linux, so two browsers can legitimately expose the same markup slightly differently. Chrome DevTools, Firefox's Accessibility panel and Safari's Audit tab all let you read the computed tree directly.",
        },
      ],
    },
    references: [
      {
        label: "Accessible name and description computation",
        source: "W3C, accname",
        url: "https://www.w3.org/TR/accname-1.2/",
      },
      {
        label: "ARIA Authoring Practices Guide",
        source: "W3C",
        url: "https://www.w3.org/WAI/ARIA/apg/",
      },
      {
        label: "The accessibility tree",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree",
      },
    ],
    related: ["render-invalidation", "why-render"],
  },
  {
    id: "dependency-weight",
    number: 18,
    slug: "it-brought-87-friends",
    title: "You installed 4KB. It brought 87 friends.",
    lab: "architecture",
    difficulty: "SYSTEMS",
    estimatedMinutes: 9,
    type: "INVESTIGATION",
    summary:
      "A dependency graph, weighed honestly: transitive depth, duplicate versions and the tree-shaking that did not happen.",
    question:
      "Why does adding one small utility increase the bundle by far more than its own size, and why does the same library appear three times?",
    hypothesis:
      "Install size, transitive depth and shipped bytes are three different numbers. Only the third one matters to users, and it depends on module format and how the package is authored.",
    concepts: [
      "transitive dependencies",
      "tree shaking",
      "side effects",
      "ESM vs CJS",
      "duplication",
    ],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "Add packages to the graph and watch the transitive closure, the duplicate versions and the estimated shipped weight.",
        },
        { type: "sim", sim: "dependency-graph", caption: "Dependency observatory. LAB-09" },
      ],
      observation: [
        {
          type: "callout",
          variant: "joke",
          text: "YOU INSTALLED 4KB OF FUNCTIONALITY. IT BROUGHT 87 FRIENDS. THEY ARE STAYING THE WEEK.",
        },
        {
          type: "prose",
          text: "Two packages depending on different major versions of a third do not deduplicate, both copies ship. This is the usual explanation for a bundle that grew by 90KB when you added something described as tiny.",
        },
      ],
      explanation: [
        {
          type: "steps",
          title: "Why tree shaking fails",
          items: [
            "The package ships CommonJS. `require` is dynamic, so the bundler cannot statically prove which exports are unused.",
            'The package has no `"sideEffects": false` field, so the bundler must assume importing any file has observable effects.',
            "A barrel file re-exports everything, and one re-exported module has a side effect at module scope.",
            "The import is a namespace import that is then indexed dynamically.",
            "The code is only reachable at runtime through a dynamic key, so nothing can be proven dead.",
          ],
        },
        {
          type: "code",
          lang: "json",
          caption: "What a well-behaved package declares",
          code: `{
 "type": "module",
 "sideEffects": false,
 "exports": {
 ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
 "./utils": "./dist/utils.js"
 }
}`,
        },
        {
          type: "table",
          head: ["Number", "Means", "Who cares"],
          rows: [
            ["Install size", "Everything on disk in node_modules", "CI time, disk, install speed"],
            ["Package size", "The published tarball", "Registry and install speed"],
            [
              "Bundle impact",
              "Bytes added to the shipped output",
              "Your users, the only one they feel",
            ],
            ["Parse/execute cost", "CPU time on the device", "INP and time to interactive"],
          ],
        },
        {
          type: "callout",
          variant: "warning",
          title: "Supply chain is a security surface, not only a size one",
          text: "Every transitive dependency is code you execute with your privileges, and postinstall scripts run at install time. Lockfiles, integrity hashes, pinned versions and audit tooling exist because the graph is much larger than the part you chose.",
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "The strongest lever is rarely a lighter alternative, it is deleting the need. Date formatting, unique ids, deep clone, debounce and query-string parsing all have adequate platform equivalents now: `Intl.DateTimeFormat`, `crypto.randomUUID()`, `structuredClone()`, and `URLSearchParams`. The best dependency is the one you did not need.",
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
        label: "Package entry points, exports",
        source: "Node.js",
        url: "https://nodejs.org/api/packages.html#package-entry-points",
      },
    ],
    related: ["perf-rescue", "main-thread"],
  },
];
