// "Как это сделано" — the process behind a case: problem → solution → steps (with real
// prompts) → results → lessons. Shown on a case page only when an entry exists for its slug.
// See docs/making-of-template.md for what to write in each field.

export interface MakingOfStep {
  title: string;
  text: string;
  /** A real prompt or message used at this step (shown as a code block). */
  prompt?: string;
  image?: { src: string; alt: string };
}

export interface MakingOf {
  problem: string;
  solution: string;
  steps: MakingOfStep[];
  /** Before/after numbers, e.g. ["Время на заявку", "3 мин → 20 сек"]. */
  results?: Array<[string, string]>;
  lessons?: string[];
}

export const makingOf: Record<string, MakingOf> = {};

export function getMakingOf(slug: string | undefined) {
  return slug ? makingOf[slug] : undefined;
}
