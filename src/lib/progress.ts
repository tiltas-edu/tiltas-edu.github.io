// Progress of tasks in this browser. Pure helpers (tested in progress.test.ts) plus thin localStorage wrappers.
//
// A task is in one of three states:
// - review:  the last answer was wrong and the task is not solved yet ("Повторить");
// - recheck: solved, but after a mistake or with a hint; solve it again on another day without help ("Закрепить");
// - solved:  solved without help (or fixed on a later day).

export type State = 'review' | 'recheck' | 'solved';
export interface Log {
  state: State;
  /** Last wrong answers, newest first, at most 3 distinct. */
  wrong: string[];
  /** Wrong answers in total, kept after the task is solved. */
  mistakes: number;
  /** Solved on the very first check, without hints. */
  first: boolean;
  /** Local day (YYYY-MM-DD) of the last wrong or helped answer: a task fixed that day comes back the next one. */
  day: string;
  at: number;
}

export const day = (now: number) => {
  const d = new Date(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** The new log after one check. `helped`: a hint was opened or a wrong answer given on this visit. */
export function record(prev: Log | null, r: { ok: boolean; value: string; helped: boolean; now: number }): Log {
  const today = day(r.now);
  if (!r.ok) {
    return {
      state: 'review',
      wrong: [r.value, ...(prev?.wrong ?? []).filter((w) => w !== r.value)].slice(0, 3),
      mistakes: (prev?.mistakes ?? 0) + 1,
      first: false,
      day: today,
      at: r.now,
    };
  }
  if (!prev) return { state: r.helped ? 'recheck' : 'solved', wrong: [], mistakes: 0, first: !r.helped, day: r.helped ? today : '', at: r.now };
  // A solved task stays solved when the child opens a hint later.
  if (prev.state === 'solved') return { ...prev, at: r.now };
  const clean = !r.helped && prev.day !== today;
  return { ...prev, state: clean ? 'solved' : 'recheck', day: clean ? prev.day : today, at: r.now };
}

export interface Item { id: string; subject: string; group: string }
export interface Count { total: number; solved: number; recheck: number; review: number; mistakes: number; first: number }

const empty = (): Count => ({ total: 0, solved: 0, recheck: 0, review: 0, mistakes: 0, first: 0 });

/** Counts by a key of the task (subject or group), plus `all`. */
export function count(items: Item[], logs: Record<string, Log | null>, by: 'subject' | 'group') {
  const out: Record<string, Count> = { all: empty() };
  for (const it of items) {
    const c = (out[it[by]] ??= empty());
    for (const x of [c, out.all]) {
      x.total++;
      const l = logs[it.id];
      if (!l) continue;
      x[l.state]++;
      x.mistakes += l.mistakes;
      if (l.first) x.first++;
    }
  }
  return out;
}

/** Groups with mistakes, most first. */
export const weakGroups = (items: Item[], logs: Record<string, Log | null>) =>
  Object.entries(count(items, logs, 'group'))
    .filter(([g, c]) => g !== 'all' && c.mistakes > 0)
    .sort((a, b) => b[1].mistakes - a[1].mistakes || a[0].localeCompare(b[0]))
    .map(([group, c]) => ({ group, ...c }));

// ---- Storage. Every access is wrapped: private mode or blocked storage simply remembers nothing.

const PREFIX = 'tiltas:log:';
// Keys of the first version (before 1.1): solved flag and the last wrong answer.
const OLD_SOLVED = 'tiltas:solved:';
const OLD_MISTAKE = 'tiltas:mistake:';

export function load(id: string): Log | null {
  try {
    const raw = localStorage.getItem(PREFIX + id);
    if (raw) return JSON.parse(raw) as Log;
    if (localStorage.getItem(OLD_SOLVED + id)) return { state: 'solved', wrong: [], mistakes: 0, first: false, day: '', at: 0 };
    const old = JSON.parse(localStorage.getItem(OLD_MISTAKE + id) || 'null') as { value: string; at: number } | null;
    if (old) return { state: 'review', wrong: [old.value], mistakes: 1, first: false, day: day(old.at || 0), at: old.at || 0 };
  } catch { /* nothing remembered */ }
  return null;
}

export function save(id: string, log: Log) {
  try {
    localStorage.setItem(PREFIX + id, JSON.stringify(log));
    localStorage.removeItem(OLD_SOLVED + id);
    localStorage.removeItem(OLD_MISTAKE + id);
  } catch { /* nothing to remember */ }
}

export const loadAll = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, load(id)]));

export function clearAll() {
  try {
    for (const k of Object.keys(localStorage)) if ([PREFIX, OLD_SOLVED, OLD_MISTAKE].some((p) => k.startsWith(p))) localStorage.removeItem(k);
  } catch { /* nothing remembered */ }
}
