import { describe, expect, it } from 'vitest';
import { layout, problem, textAt, type Op } from './column';

const final = (op: Op, a: number, b: number) => {
  const l = layout(op, a, b);
  return textAt(l, l.steps.length - 1);
};

describe('column layouts', () => {
  it('adds with carries', () => {
    expect(final('add', 478, 356)).toEqual([' 11', ' 478', '+356', ' 834']);
  });

  it('subtracts, borrowing through zeros', () => {
    // 1003 − 8: the thousand lends 1, both zeros become 9, the units become 13; lent digits are crossed out.
    expect(final('sub', 1003, 8)).toEqual([' 09913', ' ////', '−   8', '  995']);
  });

  it('multiplies by one digit with carries', () => {
    expect(final('mul', 45, 7)).toEqual(['  3', '  45', '×  7', ' 315']);
  });

  it('multiplies by two digits with a shifted row', () => {
    expect(final('mul', 45, 19)).toEqual(['', '  45', '× 19', ' 405', '+45', ' 855']);
  });

  it('skips a zero digit of the multiplier', () => {
    expect(final('mul', 12, 20)).toEqual(['', '  12', '× 20', ' 240']);
    expect(final('mul', 123, 105)).toEqual(['', '   123', '×  105', '   615', '+123', ' 12915']);
  });

  it('divides with a zero in the quotient', () => {
    const l = layout('div', 4824, 4);
    expect(l.result).toBe(1206);
    expect(textAt(l, l.steps.length - 1)).toEqual([' 48244', '−4   1206', '  8', ' −8', '   24', '  −24', '    0']);
    expect(l.steps.some((s) => s.text.ru.includes('пишем 0'))).toBe(true);
  });

  it('gives the remainder', () => {
    const l = layout('div', 137, 4);
    expect([l.result, l.remainder]).toEqual([34, 1]);
  });

  it.each([
    ['add', 9999, 1], ['add', 5, 7], ['sub', 5000, 4999], ['sub', 7, 7], ['mul', 999, 999], ['mul', 0, 5],
    ['div', 99999, 99], ['div', 3, 7], ['div', 1000, 10], ['div', 7000, 7],
  ] as [Op, number, number][])('%s %i %i: the last row holds the answer', (op, a, b) => {
    const l = layout(op, a, b);
    const expected = { add: a + b, sub: a - b, mul: a * b, div: Math.floor(a / b) }[op];
    expect(l.result).toBe(expected);
    const end = textAt(l, l.steps.length - 1);
    if (op === 'div') expect(end[1].trim()).toContain(String(expected));
    else expect(end.at(-1)!.trim()).toBe(String(expected));
  });
});

describe('texts', () => {
  it.each([['add', 2657, 1659], ['sub', 1003, 8], ['mul', 123, 105], ['mul', 45, 7], ['div', 4824, 4], ['div', 137, 4], ['div', 3, 7]] as [Op, number, number][])(
    '%s %i %i: every step and check is in Lithuanian, Russian and English',
    (op, a, b) => {
      const l = layout(op, a, b);
      for (const t of [...l.steps.map((s) => s.text), ...l.check]) {
        expect(t.lt && t.ru && t.en).toBeTruthy();
        expect(t.lt).not.toBe(t.ru);
        expect(t.ru).not.toMatch(/[ąčęėįšųūž]/i); // no Lithuanian left inside the translation
      }
    },
  );
});

describe('problem', () => {
  it('rejects what the layout cannot draw', () => {
    expect(problem('sub', 3, 5)).not.toBeNull();
    expect(problem('div', 5, 0)).not.toBeNull();
    expect(problem('div', 500, 120)).not.toBeNull();
    expect(problem('mul', 45, 19)).toBeNull();
  });
});
