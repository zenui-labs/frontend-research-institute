import type { Experiment } from "../types";

export const PERFORMANCE_EXPERIMENTS: Experiment[] = [
  {
    id: "perf-rescue",
    number: 14,
    slug: "save-the-terrible-website",
    title: "Save the terrible website",
    lab: "performance",
    difficulty: "SYSTEMS",
    estimatedMinutes: 15,
    type: "INTERACTIVE",
    summary: "LCP 7.8s. INP 840ms. CLS 0.42. 4.8MB of JavaScript. You have a budget and a mission.",
    question:
      "Given a genuinely bad page, which fixes actually move the metrics, and which ones feel productive but change nothing?",
    hypothesis:
      "A small number of structural fixes dominate. Most micro-optimisations are noise next to render-blocking resources and main-thread work.",
    concepts: ["LCP", "INP", "CLS", "critical path", "bundle size", "image optimisation"],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "Apply interventions one at a time. The bench models how each one affects the three Core Web Vitals and the total transfer. Order matters, some fixes are only worth applying after another one lands.",
        },
        { type: "sim", sim: "perf-rescue", caption: "Site rescue bench. LAB-05" },
      ],
      observation: [
        {
          type: "table",
          caption: "Core Web Vitals thresholds (75th percentile of real users)",
          head: ["Metric", "Good", "Needs improvement", "Poor"],
          rows: [
            ["LCP. Largest Contentful Paint", "≤ 2.5s", "2.5s to 4.0s", "> 4.0s"],
            ["INP. Interaction to Next Paint", "≤ 200ms", "200ms to 500ms", "> 500ms"],
            ["CLS. Cumulative Layout Shift", "≤ 0.1", "0.1 to 0.25", "> 0.25"],
          ],
        },
        {
          type: "callout",
          variant: "fact",
          title: "Documented fact",
          text: "INP replaced FID as a Core Web Vital in March 2024. FID measured only the delay before a handler started; INP measures the whole interaction, including the handler and the paint that follows it, which is why many sites with a 'good' FID have a poor INP.",
        },
      ],
      explanation: [
        {
          type: "steps",
          title: "What actually moves each metric",
          items: [
            "LCP: remove render-blocking resources, serve the hero image in a modern format at the right size, preload it, and make sure it is not lazy-loaded.",
            "LCP: cut time to first byte, caching and edge delivery beat every client-side trick.",
            "INP: break up long tasks, move work off the main thread, and keep event handlers under a frame's budget.",
            "INP: yield with scheduler.yield() or an explicit task split so the browser can paint between chunks.",
            "CLS: reserve space, width/height on images, min-height on ad and embed slots, font-display with a matched fallback metric.",
            "CLS: never insert content above existing content after load, including banners and consent bars.",
          ],
        },
        {
          type: "code",
          lang: "html",
          caption: "Four lines that routinely fix a bad LCP and CLS",
          code: `<link rel="preconnect" href="https://cdn.example.com" crossorigin>
<link rel="preload" as="image" href="/hero.avif" fetchpriority="high">

<img src="/hero.avif" width="1600" height="900" alt="" fetchpriority="high">
<!-- width/height reserve the aspect ratio box, so nothing shifts -->`,
        },
        {
          type: "callout",
          variant: "myth",
          title: "Popular intervention that usually does nothing",
          text: '`loading="lazy"` on the hero image. It delays the one resource LCP is measuring. Lazy-load what is below the fold; eagerly load what is not.',
        },
        {
          type: "prose",
          text: "Bundle size matters, but not linearly. 1MB of JavaScript costs transfer time once, and parse + compile + execute time on every single load, on a CPU that may be five times slower than yours. That is why removing 200KB of JavaScript often beats removing 2MB of images.",
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "Lab data (Lighthouse) and field data (Chrome UX Report) answer different questions. Lighthouse is a reproducible synthetic run used to compare changes; CrUX is what your actual users experienced, on their actual devices, over 28 days. A perfect Lighthouse score with a poor CrUX report means your synthetic profile does not resemble your users.",
        },
        {
          type: "callout",
          variant: "joke",
          text: "SYSTEM STATUS: The terrible website has been saved 4,182 times. It gets worse every night. Nobody has admitted to this.",
        },
      ],
    },
    references: [
      { label: "Core Web Vitals", source: "web.dev", url: "https://web.dev/articles/vitals" },
      { label: "Optimize INP", source: "web.dev", url: "https://web.dev/articles/optimize-inp" },
      { label: "Optimize LCP", source: "web.dev", url: "https://web.dev/articles/optimize-lcp" },
    ],
    related: ["main-thread", "url-journey", "dependency-weight"],
  },
  {
    id: "main-thread",
    number: 15,
    slug: "main-thread-blocking-experiment",
    title: "Main-thread blocking experiment",
    lab: "performance",
    difficulty: "ENGINEER",
    estimatedMinutes: 8,
    type: "MEASUREMENT",
    summary:
      "Run real work on your real main thread and watch your real frame rate fall over. No simulation.",
    question:
      "What does 'blocking the main thread' feel like, measured rather than described, and which escape hatches actually help?",
    hypothesis:
      "Any single task longer than ~50ms is a long task. Above ~200ms, input feels broken. Splitting the same total work into small chunks keeps the page responsive without making it finish sooner.",
    concepts: ["long tasks", "frame budget", "yielding", "web workers", "INP"],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "This bench runs genuine synchronous work on your main thread and measures the frames that were lost. Compare a single blocking task with the same work split into chunks, and with the same work moved to a worker.",
        },
        { type: "sim", sim: "main-thread", caption: "Main-thread bench. LAB-05 · runs real work" },
      ],
      observation: [
        {
          type: "table",
          head: ["Task length", "Perceived as"],
          rows: [
            ["< 16ms", "Free, fits in a frame"],
            ["50ms", "A long task by definition; one dropped frame or two"],
            ["100ms", "Noticeable hesitation on click"],
            ["300ms", "Broken. Users click again."],
            ["1000ms+", "Users assume the page crashed"],
          ],
        },
      ],
      explanation: [
        {
          type: "prose",
          text: "The main thread runs JavaScript, style, layout, paint and most event handling. While a task runs, none of the others can, the page cannot even repaint a pressed button state. Chunking does not reduce total work; it inserts rendering opportunities so the browser can service input and paint between chunks.",
        },
        {
          type: "code",
          lang: "js",
          caption: "Three ways to stop blocking",
          code: `// 1. Yield explicitly (Chromium; fall back to a task split elsewhere)
for (const chunk of chunks) {
 process(chunk);
 if (navigator.scheduling?.isInputPending?.()) await scheduler.yield();
}

// 2. Split across tasks, works everywhere
const yieldToMain = () => new Promise((r) => setTimeout(r, 0));

// 3. Move it off the thread entirely
const worker = new Worker(new URL("./heavy.worker.js", import.meta.url), { type: "module" });
worker.postMessage(payload);`,
        },
        {
          type: "callout",
          variant: "warning",
          title: "Workers are not a universal answer",
          text: "A worker has no DOM access, and structured-cloning a large object across the boundary has its own cost. Workers pay off for pure computation, parsing, diffing, compression, image work, not for code that mostly touches the DOM.",
        },
        {
          type: "why",
          question: "Why can't the browser just interrupt my function?",
          chain: {
            answer: "Because JavaScript on the main thread has run-to-completion semantics.",
            next: {
              answer:
                "The language guarantees that a function runs without another turn of the loop observing it mid-way, so no other code can see a half-mutated state.",
              next: {
                answer:
                  "That guarantee is what makes shared-nothing single-threaded code safe to write without locks.",
                next: {
                  answer:
                    "The price is that yielding must be voluntary. Every scheduler in the ecosystem. React's, the platform's, yours, is a way of choosing to yield.",
                },
              },
            },
          },
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "The Long Animation Frames API (LoAF) reports frames that took too long together with attribution: which script, which source location, how much was style and layout. It is significantly more actionable than the older Long Tasks API, which could tell you that something took 300ms but not what.",
        },
      ],
    },
    references: [
      {
        label: "Optimize long tasks",
        source: "web.dev",
        url: "https://web.dev/articles/optimize-long-tasks",
      },
      {
        label: "Long Animation Frames API",
        source: "web.dev",
        url: "https://web.dev/articles/loaf-api",
      },
      {
        label: "Using Web Workers",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers",
      },
    ],
    related: ["event-loop", "render-invalidation", "perf-rescue"],
  },
];
