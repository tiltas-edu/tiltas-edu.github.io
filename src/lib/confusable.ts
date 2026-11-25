// Look-alike words (plotas / plotis, surask / surašyk): find the letters that tell them apart.

export interface Part {
  text: string;
  diff: boolean;
}

const WORD = /[\p{L}\p{M}]+/gu;

const sharedStart = (a: string, b: string) => {
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n++;
  return n;
};

// The part of `word` that differs from `other`: what is left after their shared start and end.
// Null when the two do not look alike (too little in common to mix up).
export function differingPart(word: string, other: string): [number, number] | null {
  const a = word.toLowerCase();
  const b = other.toLowerCase();
  if (a === b) return null;
  const start = sharedStart(a, b);
  const end = Math.min(sharedStart([...a].reverse().join(''), [...b].reverse().join('')), Math.min(a.length, b.length) - start);
  const shared = start + end;
  const changed = Math.max(a.length, b.length) - shared;
  if (shared < 4 || changed > 3 || shared / Math.max(a.length, b.length) < 0.6) return null;
  // Same letters, different length (kvadratas / kvadratinis): mark at least one letter.
  return [start, Math.max(start + 1, a.length - end)];
}

export const looksAlike = (a: string, b: string) => differingPart(a, b) !== null;

// Splits `text` so that, in every word that looks like one of `others`, the differing letters are marked.
export function markDifferences(text: string, others: string[]): Part[] {
  const parts: Part[] = [];
  let last = 0;
  const push = (t: string, diff: boolean) => {
    if (!t) return;
    const prev = parts.at(-1);
    if (prev && prev.diff === diff) prev.text += t;
    else parts.push({ text: t, diff });
  };
  for (const m of text.matchAll(WORD)) {
    const word = m[0];
    // The closest look-alike decides; ties go to the first one listed.
    let best: [number, number] | null = null;
    for (const other of others) {
      const range = differingPart(word, other);
      if (range && (!best || range[1] - range[0] < best[1] - best[0])) best = range;
    }
    if (!best) continue;
    push(text.slice(last, m.index + best[0]), false);
    push(word.slice(best[0], best[1]), true);
    last = m.index + best[1];
  }
  push(text.slice(last), false);
  return parts;
}

// Single words of a glossary entry: "užrašyk / surašyk" -> both, "(mn. kilimai)" is dropped.
export const entryWords = (lt: string) =>
  lt.replace(/\(.*?\)/g, '').split('/').map((w) => w.trim()).filter((w) => w && !/\s/.test(w));
