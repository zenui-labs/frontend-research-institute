import type { Experiment } from "../types";

export const JS_EXPERIMENTS: Experiment[] = [
  {
    id: "event-loop",
    number: 5,
    slug: "event-loop-investigation",
    title: "Event loop investigation",
    lab: "javascript",
    difficulty: "ENGINEER",
    estimatedMinutes: 12,
    type: "SIMULATION",
    summary: "One call stack, two queues and a rule about when the browser is allowed to breathe.",
    question:
      "Synchronous code, microtasks and tasks all end up running on the same thread. What decides the order, and where exactly does rendering fit?",
    hypothesis:
      "The loop drains the call stack, then drains the entire microtask queue, then may render, then takes exactly one task from the task queue, and repeats.",
    concepts: [
      "event loop",
      "call stack",
      "microtask queue",
      "task queue",
      "rendering opportunity",
    ],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "Load a program into the bench and step through it one tick at a time. The call stack, microtask queue and task queue are all visible; nothing is hidden behind an abstraction.",
        },
        { type: "sim", sim: "event-loop", caption: "Event loop bench. LAB-03" },
        {
          type: "steps",
          title: "Protocol",
          items: [
            "Run the 'Classic ordering' program and predict the output before stepping.",
            "Run 'Microtask starvation' and watch the task queue never get a turn.",
            "Run 'await is a microtask', note that everything after an await is a continuation, not a callback.",
            "Run 'Render opportunity' and observe where the frame can actually be painted.",
          ],
        },
      ],
      observation: [
        {
          type: "code",
          lang: "js",
          caption: "The canonical ordering puzzle",
          code: `console.log("A");
Promise.resolve().then(() => console.log("B"));
setTimeout(() => console.log("C"), 0);
console.log("D");

// A D B C`,
        },
        {
          type: "prose",
          text: "`A` and `D` are synchronous. `B` is a microtask, drained the moment the stack empties. `C` is a task, and tasks only run on the next turn of the loop, after every microtask, including microtasks queued by other microtasks.",
        },
      ],
      explanation: [
        {
          type: "steps",
          title: "One turn of the loop (simplified from the HTML standard)",
          items: [
            "Take one task from a task queue and run it to completion.",
            "Drain the microtask checkpoint: run microtasks until the queue is empty, including newly queued ones.",
            "If this is a rendering opportunity: run animation frame callbacks, then style, layout, paint.",
            "Repeat.",
          ],
        },
        {
          type: "callout",
          variant: "fact",
          title: "Documented fact",
          text: "The microtask checkpoint runs to exhaustion. An infinitely self-queueing promise chain will freeze the page permanently, the browser never reaches the rendering step or the next task.",
        },
        {
          type: "code",
          lang: "js",
          caption: "Freezing the page without a single loop",
          code: `function starve() {
 Promise.resolve().then(starve); // never yields
}
starve();

// setTimeout(starve, 0) does the opposite:
// it yields between every call, so the page keeps painting.`,
        },
        {
          type: "table",
          caption: "Where common APIs land",
          head: ["API", "Queue"],
          rows: [
            ["Promise .then/.catch/.finally, await continuation", "Microtask"],
            ["queueMicrotask", "Microtask"],
            ["MutationObserver callback", "Microtask"],
            ["setTimeout / setInterval", "Task"],
            ["DOM event dispatch from user input", "Task"],
            ["fetch response handling", "Task, then microtasks for the promise chain"],
            ["requestAnimationFrame", "Neither, it runs in the render step, before style/layout"],
            ["requestIdleCallback", "Runs when the browser has spare time in a frame"],
          ],
        },
        {
          type: "why",
          question: "Why do microtasks exist at all?",
          chain: {
            answer:
              "So that a promise callback runs before the browser does anything else observable, including painting.",
            next: {
              answer:
                "Promises need to settle in a consistent order relative to synchronous code, without waiting a whole task.",
              next: {
                answer:
                  "If `.then` were a task, the UI could paint between a state change and its dependent update, showing a half-updated frame.",
                next: {
                  answer:
                    "The microtask checkpoint is the seam where 'the current unit of work is finished', the platform uses the same checkpoint for MutationObserver for exactly the same reason.",
                },
              },
            },
          },
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "`setTimeout(fn, 0)` does not mean zero. The HTML standard requires a minimum of 4ms once a timer has been nested five levels deep, and browsers throttle timers heavily in background tabs. If you need to yield to rendering, `requestAnimationFrame` (before the next paint) or a `MessageChannel` port message (a task with no clamping) are the better instruments.",
        },
        {
          type: "callout",
          variant: "model",
          title: "Simplified model",
          text: "This bench shows one task queue. Real browsers keep several, with separate sources for timers, user interaction and networking, and are allowed to pick between them by priority. Input wins.",
        },
      ],
    },
    references: [
      {
        label: "Event loops, processing model",
        source: "HTML Standard",
        url: "https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model",
      },
      {
        label: "Tasks, microtasks, queues and schedules",
        source: "Jake Archibald",
        url: "https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/",
      },
      {
        label: "In depth: microtasks",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide",
      },
    ],
    related: ["promise-vs-timeout", "main-thread", "render-invalidation"],
  },
  {
    id: "promise-vs-timeout",
    number: 6,
    slug: "promise-vs-settimeout",
    title: "Promise vs setTimeout",
    lab: "javascript",
    difficulty: "DEVELOPER",
    estimatedMinutes: 6,
    type: "THOUGHT",
    summary:
      "Predict the output first. Then watch the queues prove you right, or, more usefully, wrong.",
    question:
      "Given nested timeouts, promise chains and an async function, in what order does the output appear?",
    hypothesis:
      "Every microtask queued during the current turn runs before the next timer callback, no matter when the timer was scheduled.",
    concepts: ["microtask", "task", "async/await", "prediction"],
    prerequisites: ["Event loop investigation"],
    sections: {
      experiment: [
        {
          type: "code",
          lang: "js",
          caption: "Write down your prediction before you run anything.",
          code: `console.log(1);

setTimeout(() => {
 console.log(2);
 Promise.resolve().then(() => console.log(3));
});

Promise.resolve().then(() => {
 console.log(4);
 setTimeout(() => console.log(5));
});

(async () => {
 console.log(6);
 await null;
 console.log(7);
})();

console.log(8);`,
        },
        {
          type: "sim",
          sim: "event-loop",
          caption: "Load the 'Prediction' program and step through it",
        },
      ],
      observation: [
        {
          type: "code",
          lang: "text",
          code: `1
6
8
4
7
2
3
5`,
        },
        {
          type: "prose",
          text: "`6` is synchronous, the body of an async function runs immediately up to the first `await`. `8` finishes the synchronous phase. Then the microtask checkpoint drains in queue order: `4` was queued before `7`. Only then does the first timer run (`2`), and its own microtask (`3`) is drained before the second timer (`5`).",
        },
      ],
      explanation: [
        {
          type: "callout",
          variant: "fact",
          title: "The rule worth memorising",
          text: "`await` splits a function in two. Everything before it is synchronous; everything after it is a microtask continuation, even when awaiting a non-promise like `null`.",
        },
        {
          type: "prose",
          text: "`await null` still yields. The value is wrapped with `Promise.resolve()`, so resumption is scheduled as a microtask rather than continuing inline. This is why a loop of `await`s over already-resolved values is not free: each iteration costs a microtask checkpoint round trip.",
        },
        {
          type: "code",
          lang: "js",
          caption: "Same program, no await",
          code: `// Two microtask hops (await + .then)
await fetchUser();
render();

// One: the continuation is inside the handler
fetchUser().then(render);`,
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "The ordering above was standardised late. Prior to 2018 several engines resolved `await` with an extra two microtask ticks, so the same program printed a different order in Node 8 than in Node 12. If you find an old blog post that disagrees with the bench, it is probably describing the pre-optimisation semantics.",
        },
      ],
    },
    references: [
      {
        label: "await takes 2 ticks less",
        source: "V8 blog",
        url: "https://v8.dev/blog/fast-async",
      },
      {
        label: "async function",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function",
      },
    ],
    related: ["event-loop", "main-thread"],
  },
  {
    id: "closure-memory",
    number: 7,
    slug: "closure-memory-investigation",
    title: "Closure memory investigation",
    lab: "javascript",
    difficulty: "RESEARCHER",
    estimatedMinutes: 10,
    type: "INVESTIGATION",
    summary:
      "A one-line callback keeps a 40MB array alive for the lifetime of the page. Find out which line did it.",
    question:
      "Why does removing a listener sometimes free nothing, and why can a tiny function retain an enormous object?",
    hypothesis:
      "A closure retains its whole enclosing environment record, not only the variables you appear to use, so a reference chain from a GC root to that record keeps everything reachable.",
    concepts: ["closures", "environment record", "reachability", "garbage collection", "leaks"],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "The bench builds an object graph and marks what is reachable from a root. Attach and detach closures and watch which nodes survive a collection.",
        },
        { type: "sim", sim: "closure-memory", caption: "Retention bench. LAB-03" },
      ],
      observation: [
        {
          type: "code",
          lang: "js",
          caption: "Both handlers look harmless. One is not.",
          code: `function attach(node) {
 const hugeBuffer = new Array(1_000_000).fill(0); // ~8MB
 const id = node.id;

 node.addEventListener("click", () => {
 console.log(id); // only uses \`id\`…
 }); // …but may keep \`hugeBuffer\` reachable
}`,
        },
        {
          type: "prose",
          text: "Whether `hugeBuffer` survives depends on the engine's context allocation. V8 performs *context allocation analysis* and only stores variables the closure actually captures, so this specific case is usually fine. It stops being fine the moment any closure in the same scope references `hugeBuffer`, because all closures created in a scope share one context object.",
        },
      ],
      explanation: [
        {
          type: "callout",
          variant: "fact",
          title: "Documented fact",
          text: "Garbage collection is not reference counting. An object is collected when it is unreachable from a set of roots (the global object, the stack, active handles). Cycles are collected fine; a single live reference from a root is enough to retain a whole graph.",
        },
        {
          type: "code",
          lang: "js",
          caption: "The shared-context trap",
          code: `function attach(node) {
 const huge = new Array(1_000_000).fill(0);

 node.addEventListener("click", () => console.log(node.id));
 node.addEventListener("dblclick", () => console.log(huge.length));
 // ^^^^
 // Both listeners share one context object, so \`huge\` is retained
 // for as long as EITHER listener is alive.
}`,
        },
        {
          type: "table",
          caption: "Common retention paths in a browser app",
          head: ["Path", "What keeps it alive"],
          rows: [
            [
              "Detached DOM node",
              "A JS variable still references the node; its whole subtree stays",
            ],
            [
              "Event listener on a live node",
              "The handler, its closure and everything the context captures",
            ],
            ["setInterval never cleared", "The callback is a root for as long as the timer exists"],
            [
              "Module-scope cache / Map",
              "Lives as long as the module, use WeakMap when keys are objects",
            ],
            ["Promise that never settles", "Its reactions and their closures"],
            [
              "Console-logged object in devtools",
              "Retained by the console itself, a classic false positive",
            ],
          ],
        },
        {
          type: "why",
          question: "Why can't the engine just free what I stopped using?",
          chain: {
            answer: "Because 'stopped using' is not decidable, only 'unreachable' is.",
            next: {
              answer:
                "The collector walks the object graph from its roots and marks everything it can reach. Anything unmarked is garbage.",
              next: {
                answer:
                  "Reachability is a conservative approximation of liveness. A variable you will never touch again is still reachable if something points at it.",
                next: {
                  answer:
                    "So all leak fixes are the same fix: break the reference chain. Remove the listener, clear the timer, null the field, or use a WeakRef/WeakMap so the reference does not count as a retaining edge.",
                },
              },
            },
          },
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "Modern V8 uses a generational collector: a small, fast scavenger for the young generation, and a concurrent mark-and-sweep/compact cycle for the old generation. Short-lived allocations are genuinely cheap, the expensive pattern is *surviving* the scavenge, which promotes an object to old space and makes it the major collector's problem.",
        },
        {
          type: "callout",
          variant: "warning",
          title: "Measurement beats intuition",
          text: "Do not guess. Take two heap snapshots around a repeated action, use the 'Objects allocated between snapshot 1 and 2' filter, and read the retainer chain. Detached nodes and closure contexts show up by name.",
        },
      ],
    },
    references: [
      {
        label: "Memory management",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management",
      },
      {
        label: "Trash talk: the Orinoco garbage collector",
        source: "V8 blog",
        url: "https://v8.dev/blog/trash-talk",
      },
      {
        label: "Fix memory problems",
        source: "Chrome DevTools",
        url: "https://developer.chrome.com/docs/devtools/memory-problems",
      },
    ],
    related: ["event-loop", "main-thread", "why-render"],
  },
  {
    id: "coercion",
    number: 8,
    slug: "javascript-coercion-experiment",
    title: "JavaScript coercion experiment",
    lab: "javascript",
    difficulty: "DEVELOPER",
    estimatedMinutes: 7,
    type: "INTERACTIVE",
    summary:
      "`[] + []` is an empty string. `[] + {}` is an object tag. `{} + []` is zero, but only in a console. All of it follows one algorithm.",
    question:
      "Is JavaScript coercion arbitrary, or is there a single spec algorithm that explains every famous example?",
    hypothesis:
      "Every case reduces to ToPrimitive, followed by the rules for `+` and for relational and equality comparison. No exceptions, no magic.",
    concepts: ["ToPrimitive", "valueOf", "toString", "abstract equality", "type coercion"],
    sections: {
      experiment: [
        {
          type: "prose",
          text: "Pick an expression, predict the result, then expand the spec trace. The bench evaluates the real expression in your browser and shows the algorithm steps beside it.",
        },
        { type: "sim", sim: "coercion", caption: "Coercion bench. LAB-03" },
      ],
      observation: [
        {
          type: "prose",
          text: 'The `+` operator is the only arithmetic operator that is also string concatenation. It calls ToPrimitive on both operands with no hint, and if *either* result is a string, it concatenates. Arrays stringify by joining, so `[] + []` is `"" + ""`.',
        },
      ],
      explanation: [
        {
          type: "steps",
          title: "ToPrimitive(input, hint), simplified",
          items: [
            "If the input is already a primitive, return it.",
            "If it has a Symbol.toPrimitive method, call it with the hint and return the result.",
            "For hint 'string': try toString(), then valueOf().",
            "For hint 'number' or 'default': try valueOf(), then toString().",
            "If neither returns a primitive, throw a TypeError.",
          ],
        },
        {
          type: "table",
          caption: "Famous specimens, explained",
          head: ["Expression", "Result", "Why"],
          rows: [
            ["[] + []", '""', 'Both stringify to "", concatenation wins'],
            ["[] + {}", '"[object Object]"', '"" + the object\'s default string tag'],
            [
              "{} + []",
              "0",
              "Only in a console: the leading {} parses as a block, so this is +[] → 0",
            ],
            ["[] == false", "true", "Both sides → 0 via ToNumber"],
            [
              "null == undefined",
              "true",
              "Special-cased in the spec; they equal each other and nothing else",
            ],
            ["null == 0", "false", "No numeric conversion is performed for null"],
            ["NaN === NaN", "false", "IEEE-754, use Object.is or Number.isNaN"],
            ['"2" > "10"', "true", "Both strings → lexicographic comparison, not numeric"],
            ["0.1 + 0.2 === 0.3", "false", "Binary floating point, not coercion at all"],
          ],
        },
        {
          type: "callout",
          variant: "note",
          title: "Not actually a coercion bug",
          text: "`0.1 + 0.2 !== 0.3` is IEEE-754 double precision, identical in Python, Java and C. The institute keeps it in the coercion cabinet only because people file it there.",
        },
      ],
      deeper: [
        {
          type: "prose",
          text: "Abstract equality (`==`) has a short, learnable table, but `===` plus explicit conversion communicates intent, and linters flag `==` for the same reason surgeons label their instruments. The one defensible use is `x == null`, which tests for `null` *or* `undefined` in a single comparison.",
        },
        {
          type: "callout",
          variant: "joke",
          text: "CAUTION: Prolonged exposure to the abstract equality table has been linked to strong opinions at conferences.",
        },
      ],
    },
    references: [
      {
        label: "ToPrimitive",
        source: "ECMA-262",
        url: "https://tc39.es/ecma262/#sec-toprimitive",
      },
      {
        label: "IsLooselyEqual (abstract equality)",
        source: "ECMA-262",
        url: "https://tc39.es/ecma262/#sec-islooselyequal",
      },
      {
        label: "Equality comparisons and sameness",
        source: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness",
      },
    ],
    related: ["event-loop", "closure-memory"],
  },
];
