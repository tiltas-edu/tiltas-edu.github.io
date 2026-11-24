export interface RankedWord {
  lemma: string;
  pos: string;
  ru: string;
  en: string;
  forms: string[];
  tasks: number;
  bySubject: Record<string, number>;
}

export const POS = ['verb', 'noun', 'adj', 'prep'] as const;
export const GROUPS = [...POS, 'other'] as const;
export type Group = (typeof GROUPS)[number];
export type Filter = Group | 'all';

const QUOTA = { verb: 3, noun: 3, adj: 2, prep: 2 };
const DECK_SIZE = 10;

// One subject's ranking: its words only, counted and re-ranked by that subject's tasks.
// The sort is stable, so ties keep the overall order.
export function forSubject(words: RankedWord[], subject: string | null): RankedWord[] {
  if (!subject) return words;
  return words
    .filter((w) => w.bySubject[subject])
    .map((w) => ({ ...w, tasks: w.bySubject[subject] }))
    .sort((a, b) => b.tasks - a.tasks);
}

// `words` is already ranked by scripts/word-frequency.mjs.
export function inGroup(words: RankedWord[], group: Group) {
  return words.filter((w) => (group === 'other' ? !(POS as readonly string[]).includes(w.pos) : w.pos === group));
}

// "All" takes the top of each part of speech, otherwise ir / į / iš would push the verbs out.
// When a part of speech is short, the overall ranking fills the gap.
export function studyDeck(words: RankedWord[], filter: Filter) {
  if (filter !== 'all') return inGroup(words, filter).slice(0, DECK_SIZE);
  const picked = POS.flatMap((pos) => inGroup(words, pos).slice(0, QUOTA[pos]));
  const rest = words.filter((w) => !picked.includes(w));
  return [...picked, ...rest].slice(0, DECK_SIZE);
}
