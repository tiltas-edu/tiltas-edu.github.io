// Answer checking for TaskCheck. Pure functions, covered by answer.test.ts.

// First number in the input, so a unit typed after it ("216 m2", "5 000 cm²") is ignored.
export const norm = (s: string) =>
  (s.match(/-?\d[\d\s ]*(?:[.,]\d+)?/)?.[0] ?? '').replace(/[\s ]/g, '').replace(',', '.');

const text = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

/** Numbers are compared as numbers; a text answer (a chosen option) must match exactly, ignoring case. */
export const same = (expected: string, given: string) =>
  norm(expected) !== '' ? norm(given) !== '' && Number(norm(expected)) === Number(norm(given)) : text(expected) === text(given);

export const isCorrect = (accepted: string[], given: string) => accepted.some((a) => same(a, given));

/** The hint for a known wrong answer, or null. */
export const hintFor = (mistakes: { value: string; hint: string }[], given: string) =>
  mistakes.find((m) => same(m.value, given))?.hint ?? null;

// Remembered per browser: solved tasks, and the last wrong answer of a task not solved yet.
export const solvedKey = (id: string) => `tiltas:solved:${id}`;
export const mistakeKey = (id: string) => `tiltas:mistake:${id}`;
