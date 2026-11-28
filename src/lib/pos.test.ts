import { describe, expect, it } from 'vitest';
import { forSubject, wordsInText, type RankedWord } from './pos';
import { frequency } from './frequency';

const word = (lemma: string, tasks: number, bySubject: Record<string, number>): RankedWord =>
  ({ lemma, pos: 'noun', ru: lemma, en: lemma, forms: [lemma], tasks, bySubject });

describe('forSubject', () => {
  const words = [word('a', 5, { math: 4, world: 1 }), word('b', 3, { world: 3 }), word('c', 2, { world: 1, math: 1 })];

  it('keeps the overall ranking without a subject', () => {
    expect(forSubject(words, null)).toBe(words);
  });

  it('keeps only the subject words, counted and ranked by that subject', () => {
    expect(forSubject(words, 'world').map((w) => [w.lemma, w.tasks])).toEqual([['b', 3], ['a', 1], ['c', 1]]);
    expect(forSubject(words, 'math').map((w) => w.lemma)).toEqual(['a', 'c']);
  });
});

describe('public ranking', () => {
  it('per-subject counts add up to the overall ones', () => {
    for (const w of frequency.words) {
      expect(Object.values(w.bySubject).reduce((a, b) => a + b, 0), w.lemma).toBe(w.tasks);
      for (const [s, n] of Object.entries(w.bySubject)) expect(n).toBeLessThanOrEqual(frequency.subjects[s]);
    }
    expect(Object.values(frequency.subjects).reduce((a, b) => a + b, 0)).toBe(frequency.tasks);
  });
});

describe('wordsInText', () => {
  const w = (lemma: string, forms: string[], tasks: number): RankedWord => ({ lemma, pos: 'other', ru: '', en: '', forms, tasks, bySubject: {} });
  const words = [w('apskaičiuoti', ['apskaičiuok'], 48), w('kiekvienas', ['kiekvienoje', 'kiekvieną'], 19), w('retas', ['retą'], 2)];

  it('finds the forms written in the text, most frequent first, and skips rare words', () => {
    expect(wordsInText(words, 'Kiekvienoje dėžėje po 6. Apskaičiuok, retą.').map((x) => x.lemma)).toEqual(['apskaičiuoti', 'kiekvienas']);
  });
  it('does not match a part of a word or a word the glossary already explains', () => {
    expect(wordsInText(words, 'kiekvienoj apskaičiuokime')).toEqual([]);
    expect(wordsInText(words, 'Apskaičiuok kiekvieną', new Set(['apskaičiuok'])).map((x) => x.lemma)).toEqual(['kiekvienas']);
  });
});
