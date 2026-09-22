import type { Experiment } from "../types";
import { CSS_EXPERIMENTS } from "./css";
import { JS_EXPERIMENTS } from "./javascript";
import { BROWSER_EXPERIMENTS } from "./browser";
import { REACT_EXPERIMENTS } from "./react";
import { PERFORMANCE_EXPERIMENTS } from "./performance";
import { SYSTEMS_EXPERIMENTS } from "./systems";
import { PLATFORM_EXPERIMENTS } from "./platform";

export const EXPERIMENTS: Experiment[] = [
  ...CSS_EXPERIMENTS,
  ...JS_EXPERIMENTS,
  ...BROWSER_EXPERIMENTS,
  ...REACT_EXPERIMENTS,
  ...PERFORMANCE_EXPERIMENTS,
  ...SYSTEMS_EXPERIMENTS,
  ...PLATFORM_EXPERIMENTS,
].sort((a, b) => a.number - b.number);
