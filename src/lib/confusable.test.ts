import { describe, expect, it } from 'vitest';
import { differingPart, entryWords, looksAlike, markDifferences } from './confusable';

const marked = (text: string, like: string[]) =>
  markDifferences(text, like).map((p) => (p.diff ? `[${p.text}]` : p.text)).join('');

describe('markDifferences', () => {
  it('marks a different ending', () => {
    expect(marked('plotas', ['plotis'])).toBe('plot[a]s');
    expect(marked('plotis', ['plotas'])).toBe('plot[i]s');
  });

  it('marks a different prefix', () => {
    expect(marked('užrašyk', ['parašyk'])).toBe('[už]rašyk');
    expect(marked('įrašyk', ['užrašyk'])).toBe('[į]rašyk');
  });

  it('marks letters in the middle', () => {
    expect(marked('surašyk', ['surask'])).toBe('sura[šy]k');
  });

  it('marks look-alikes inside a note and leaves other words alone', () => {
    expect(marked('Не путай с plotis (ширина)!', ['plotis', 'plotas'])).toBe('Не путай с plot[i]s (ширина)!');
  });

  it('leaves words that only share a few letters', () => {
    expect(marked('kiek', ['kiekis'])).toBe('kiek');
    expect(looksAlike('suma', 'sau')).toBe(false);
    expect(differingPart('plotas', 'plotas')).toBeNull();
  });
});

describe('entryWords', () => {
  it('splits alternatives and drops notes and phrases', () => {
    expect(entryWords('užrašyk / surašyk')).toEqual(['užrašyk', 'surašyk']);
    expect(entryWords('kilimas (mn. kilimai)')).toEqual(['kilimas']);
    expect(entryWords('kiek atpigo')).toEqual([]);
  });
});

// Every glossary: two look-alike words must point at each other, so the child sees what tells them apart.
const glossaries = import.meta.glob<{ terms: { lt: string; like?: string[] }[] }>('../content/glossary/*.json', {
  eager: true,
  import: 'default',
});

describe.each(Object.entries(glossaries))('%s', (_, { terms }) => {
  const words = terms.flatMap((t) => entryWords(t.lt).map((w) => ({ w, t })));

  it('links every pair of look-alike words', () => {
    for (const a of words)
      for (const b of words)
        if (a.t !== b.t && looksAlike(a.w, b.w)) expect(a.t.like ?? [], `${a.w} looks like ${b.w}`).toContain(b.w);
  });

  it('lists only words that really look alike', () => {
    for (const t of terms)
      for (const l of t.like ?? []) expect(entryWords(t.lt).some((w) => looksAlike(w, l)), `${t.lt}: ${l}`).toBe(true);
  });
});
