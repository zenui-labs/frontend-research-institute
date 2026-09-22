export type Phase = "sync" | "microtask" | "task" | "render" | "idle";

export type LoopFrame = {
  stack: string[];
  micro: string[];
  tasks: string[];
  output: string[];
  note: string;
  phase: Phase;
};

export type LoopProgram = {
  id: string;
  label: string;
  code: string;
  frames: LoopFrame[];
};

function frame(
  phase: Phase,
  note: string,
  stack: string[],
  micro: string[],
  tasks: string[],
  output: string[],
): LoopFrame {
  return { phase, note, stack, micro, tasks, output };
}

const CLASSIC: LoopProgram = {
  id: "classic",
  label: "Classic ordering",
  code: `console.log("A");
Promise.resolve().then(() => console.log("B"));
setTimeout(() => console.log("C"), 0);
console.log("D");`,
  frames: [
    frame(
      "sync",
      "The script itself is a task. It runs to completion before anything else.",
      ["<script>"],
      [],
      [],
      [],
    ),
    frame(
      "sync",
      'console.log("A") is called and returns.',
      ["<script>", "console.log"],
      [],
      [],
      ["A"],
    ),
    frame(
      "sync",
      "The promise is already resolved, so its reaction is queued as a microtask.",
      ["<script>"],
      ["() => log(B)"],
      [],
      ["A"],
    ),
    frame(
      "sync",
      "setTimeout hands the callback to the timer source; it becomes a task.",
      ["<script>"],
      ["() => log(B)"],
      ["() => log(C)"],
      ["A"],
    ),
    frame(
      "sync",
      'console.log("D") runs. Still inside the same task.',
      ["<script>", "console.log"],
      ["() => log(B)"],
      ["() => log(C)"],
      ["A", "D"],
    ),
    frame(
      "microtask",
      "The stack is empty. The microtask checkpoint begins.",
      [],
      ["() => log(B)"],
      ["() => log(C)"],
      ["A", "D"],
    ),
    frame(
      "microtask",
      "The microtask runs. Any microtask it queues would also run now.",
      ["() => log(B)"],
      [],
      ["() => log(C)"],
      ["A", "D", "B"],
    ),
    frame(
      "render",
      "Microtask queue empty. This is a rendering opportunity: style, layout, paint may run.",
      [],
      [],
      ["() => log(C)"],
      ["A", "D", "B"],
    ),
    frame(
      "task",
      "Next turn of the loop: exactly one task is taken.",
      ["() => log(C)"],
      [],
      [],
      ["A", "D", "B", "C"],
    ),
    frame("idle", "Everything drained. Output: A D B C.", [], [], [], ["A", "D", "B", "C"]),
  ],
};

const PREDICTION: LoopProgram = {
  id: "prediction",
  label: "Prediction",
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
  frames: [
    frame("sync", "Script task begins.", ["<script>"], [], [], []),
    frame("sync", "log(1), synchronous.", ["<script>", "log"], [], [], ["1"]),
    frame("sync", "setTimeout queues task T1.", ["<script>"], [], ["T1"], ["1"]),
    frame("sync", "The resolved promise queues microtask M1.", ["<script>"], ["M1"], ["T1"], ["1"]),
    frame(
      "sync",
      "The async function body runs synchronously up to the first await: log(6).",
      ["<script>", "async fn"],
      ["M1"],
      ["T1"],
      ["1", "6"],
    ),
    frame(
      "sync",
      "await null suspends. The continuation is queued as microtask M2.",
      ["<script>"],
      ["M1", "M2"],
      ["T1"],
      ["1", "6"],
    ),
    frame(
      "sync",
      "log(8) closes the synchronous phase.",
      ["<script>", "log"],
      ["M1", "M2"],
      ["T1"],
      ["1", "6", "8"],
    ),
    frame(
      "microtask",
      "Checkpoint. M1 runs first, it was queued first.",
      ["M1"],
      ["M2"],
      ["T1"],
      ["1", "6", "8", "4"],
    ),
    frame(
      "microtask",
      "M1 queued task T2 while running. Tasks wait; microtasks do not.",
      [],
      ["M2"],
      ["T1", "T2"],
      ["1", "6", "8", "4"],
    ),
    frame(
      "microtask",
      "M2 resumes the async function after its await.",
      ["M2"],
      [],
      ["T1", "T2"],
      ["1", "6", "8", "4", "7"],
    ),
    frame(
      "render",
      "Microtasks exhausted. Rendering opportunity.",
      [],
      [],
      ["T1", "T2"],
      ["1", "6", "8", "4", "7"],
    ),
    frame(
      "task",
      "Task T1 runs: log(2), and queues a microtask.",
      ["T1"],
      ["M3"],
      ["T2"],
      ["1", "6", "8", "4", "7", "2"],
    ),
    frame(
      "microtask",
      "The checkpoint runs after every task, not only after the script.",
      ["M3"],
      [],
      ["T2"],
      ["1", "6", "8", "4", "7", "2", "3"],
    ),
    frame(
      "task",
      "Task T2 runs: log(5).",
      ["T2"],
      [],
      [],
      ["1", "6", "8", "4", "7", "2", "3", "5"],
    ),
    frame(
      "idle",
      "Final output: 1 6 8 4 7 2 3 5.",
      [],
      [],
      [],
      ["1", "6", "8", "4", "7", "2", "3", "5"],
    ),
  ],
};

const STARVATION: LoopProgram = {
  id: "starvation",
  label: "Microtask starvation",
  code: `function starve() {
 Promise.resolve().then(starve);
}
starve();

setTimeout(() => console.log("never"), 0);`,
  frames: [
    frame("sync", "Script task begins.", ["<script>"], [], [], []),
    frame("sync", "starve() queues a microtask, then returns.", ["<script>"], ["starve"], [], []),
    frame(
      "sync",
      "setTimeout queues a task. It looks harmless.",
      ["<script>"],
      ["starve"],
      ["log(never)"],
      [],
    ),
    frame("microtask", "Checkpoint begins. starve runs…", ["starve"], [], ["log(never)"], []),
    frame(
      "microtask",
      "…and queues another microtask before returning.",
      [],
      ["starve"],
      ["log(never)"],
      [],
    ),
    frame(
      "microtask",
      "The checkpoint must run until the queue is empty. It never is.",
      ["starve"],
      ["starve"],
      ["log(never)"],
      [],
    ),
    frame(
      "microtask",
      "No rendering opportunity. No task. The tab is frozen, permanently.",
      ["starve"],
      ["starve", "starve"],
      ["log(never)"],
      [],
    ),
  ],
};

const RENDER: LoopProgram = {
  id: "render",
  label: "Render opportunity",
  code: `button.addEventListener("click", () => {
 box.classList.add("moved"); // style invalidated
 requestAnimationFrame(() => {
 read(box.offsetTop); // runs before paint
 });
 Promise.resolve().then(() => {
 read(box.offsetTop); // forces layout NOW
 });
});`,
  frames: [
    frame("task", "The click event is dispatched as a task.", ["click handler"], [], [], []),
    frame(
      "task",
      "classList.add invalidates style. Nothing is recalculated yet, it is batched.",
      ["click handler"],
      [],
      [],
      ["style invalidated"],
    ),
    frame(
      "task",
      "rAF callback is registered for the render step; the promise reaction is a microtask.",
      ["click handler"],
      ["promise reaction"],
      [],
      ["style invalidated"],
    ),
    frame(
      "microtask",
      "Checkpoint: the microtask reads offsetTop and forces a synchronous layout, before the frame.",
      ["promise reaction"],
      [],
      [],
      ["style invalidated", "forced layout"],
    ),
    frame(
      "render",
      "Render step: rAF callbacks run first, still before style and layout.",
      ["rAF callback"],
      [],
      [],
      ["style invalidated", "forced layout", "rAF"],
    ),
    frame(
      "render",
      "Then style → layout → paint → composite for this frame.",
      [],
      [],
      [],
      ["style invalidated", "forced layout", "rAF", "frame painted"],
    ),
    frame(
      "idle",
      "One frame produced. The forced layout in the microtask was pure waste.",
      [],
      [],
      [],
      ["style invalidated", "forced layout", "rAF", "frame painted"],
    ),
  ],
};

export const PROGRAMS: LoopProgram[] = [CLASSIC, PREDICTION, STARVATION, RENDER];
