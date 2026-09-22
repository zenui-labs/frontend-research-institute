"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { play } from "@/lib/sound";
import { RetroButton } from "@/components/ui/retro-button";
import { SimFrame } from "./sim-frame";

/** Escape hatch: TypeScript refuses to type-check the very expressions under study. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const js = (value: unknown): any => value;

type Specimen = {
  expr: string;
  run: () => string;
  steps: string[];
};

/** Every result is produced by actually evaluating the expression in your browser. */
const SPECIMENS: Specimen[] = [
  {
    expr: "[] + []",
    run: () => JSON.stringify(js([]) + js([])),
    steps: [
      "+ calls ToPrimitive on both operands with no hint.",
      "For an array, valueOf() returns the array itself, not a primitive.",
      'toString() is tried next: [].join(",") === "".',
      'Both operands are strings, so + concatenates: "" + "".',
    ],
  },
  {
    expr: "[] + {}",
    run: () => JSON.stringify(js([]) + js({})),
    steps: [
      '[] → "" as before.',
      '{} → Object.prototype.toString() → "[object Object]".',
      "One operand is a string, so + concatenates.",
    ],
  },
  {
    expr: "[] == false",
    run: () => String(js([]) == js(false)),
    steps: [
      "Neither side is the same type, so the abstract equality algorithm runs.",
      "false → ToNumber(false) === 0.",
      '[] → ToPrimitive([]) === "" → ToNumber("") === 0.',
      "0 === 0.",
    ],
  },
  {
    expr: "null == undefined",
    run: () => String(null == undefined),
    steps: [
      "The spec special-cases this pair before any conversion.",
      "null and undefined are loosely equal to each other, and to nothing else.",
      "null == 0 is false, no numeric conversion is applied.",
    ],
  },
  {
    expr: "NaN === NaN",
    run: () => String(js(NaN) === js(NaN)),
    steps: [
      "Not coercion at all: IEEE-754 defines NaN as unequal to everything, including itself.",
      "Object.is(NaN, NaN) is true; Number.isNaN(x) is the practical test.",
    ],
  },
  {
    expr: '"2" > "10"',
    run: () => String(js("2") > js("10")),
    steps: [
      "Relational comparison converts operands with hint 'number', unless both are strings.",
      "Both are strings, so the comparison is lexicographic, character by character.",
      '"2" > "1" at the first character, so the answer is decided immediately.',
    ],
  },
  {
    expr: "0.1 + 0.2 === 0.3",
    run: () => String(js(0.1 + 0.2) === js(0.3)),
    steps: [
      "Also not coercion: binary floating point cannot represent 0.1 or 0.2 exactly.",
      "0.1 + 0.2 evaluates to 0.30000000000000004.",
      "Compare with an epsilon, or work in integers (cents, not euros).",
    ],
  },
  {
    expr: "typeof null",
    run: () => typeof null,
    steps: [
      "A bug from the first implementation of JavaScript in 1995.",
      "Values were tagged; the object tag was 0, and null was the null pointer, also 0.",
      "Fixing it would break existing code, so it is now permanent.",
    ],
  },
  {
    expr: "[1, 2, 3] + [4, 5]",
    run: () => JSON.stringify(js([1, 2, 3]) + js([4, 5])),
    steps: [
      'Both arrays stringify via join(",").',
      '"1,2,3" + "4,5" concatenates with no separator between them.',
    ],
  },
  {
    expr: "Number('')",
    run: () => String(Number("")),
    steps: [
      "ToNumber on an empty (or whitespace-only) string is 0, by definition.",
      'Number("abc") is NaN. Number(null) is 0. Number(undefined) is NaN.',
    ],
  },
];

export default function CoercionSim() {
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [solved, setSolved] = useState<string[]>([]);

  const specimen = SPECIMENS[index];
  const actual = specimen.run();
  const correct =
    revealed && guess.trim().replace(/^["']|["']$/g, "") === actual.replace(/^"|"$/g, "");

  function select(next: number) {
    setIndex(next);
    setGuess("");
    setRevealed(false);
  }

  return (
    <SimFrame
      code="BENCH-03B"
      title="Coercion"
      status={`${solved.length} / ${SPECIMENS.length} EXAMINED`}
      readout={
        revealed ? (
          <p>
            <span className="text-steel-dim">RESULT </span>
            <span className="text-crt">{actual}</span>
            {correct ? <span className="text-crt ml-3">PREDICTION CORRECT</span> : null}
          </p>
        ) : (
          <p className="text-steel-dim">
            Enter a prediction, then reveal. Guessing is part of the method.
          </p>
        )
      }
    >
      <div className="bg-line grid gap-px sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)]">
        <ul className="bg-ink-800 max-h-[340px] overflow-y-auto">
          {SPECIMENS.map((item, i) => (
            <li key={item.expr}>
              <button
                type="button"
                onClick={() => select(i)}
                className={cn(
                  "border-line/60 flex w-full items-center justify-between gap-2 border-b px-3 py-2 text-left font-mono text-xs transition-colors",
                  i === index
                    ? "bg-crt/10 text-crt"
                    : "text-steel hover:bg-ink-700 hover:text-bone",
                )}
              >
                <span className="truncate">{item.expr}</span>
                {solved.includes(item.expr) ? <span className="text-crt/70">✓</span> : null}
              </button>
            </li>
          ))}
        </ul>

        <div className="bg-ink-850 p-5">
          <p className="label-tech mb-2">Expression</p>
          <pre className="border-line bg-ink-900 text-paper mb-4 border px-3 py-3 font-mono text-base">
            {specimen.expr}
          </pre>

          <form
            className="mb-4 flex flex-wrap gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setRevealed(true);
              setSolved((prev) => (prev.includes(specimen.expr) ? prev : [...prev, specimen.expr]));
              play(guess.trim() === actual ? "complete" : "beep");
            }}
          >
            <input
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="your prediction"
              aria-label={`Prediction for ${specimen.expr}`}
              className="border-line bg-ink-900 text-bone placeholder:text-steel-dim/60 min-w-0 flex-1 border px-3 py-2 font-mono text-sm"
            />
            <RetroButton variant="primary" size="sm" type="submit">
              Evaluate
            </RetroButton>
          </form>

          {revealed ? (
            <div>
              <p className="label-tech mb-2">Specification trace</p>
              <ol className="space-y-1.5">
                {specimen.steps.map((step, i) => (
                  <li key={i} className="text-steel flex gap-2 text-sm leading-relaxed">
                    <span className="text-2xs text-steel-dim font-mono">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </div>
    </SimFrame>
  );
}
