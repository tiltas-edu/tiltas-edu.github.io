import { describe, expect, it } from 'vitest';
import { LADDERS, chain, convert, parse, stepText, type Kind } from './units';

describe('units ladder', () => {
  it('goes down by multiplying, one rung at a time', () => {
    const r = convert('length', 2, 'm', 'mm');
    expect(r.value).toBe(2000);
    expect(r.steps.map((s) => [s.big.id, s.small.id, s.by, s.after])).toEqual([['m', 'dm', 10, 20], ['dm', 'cm', 10, 200], ['cm', 'mm', 10, 2000]]);
    expect(r.mixed).toBeNull();
  });
  it('goes up by dividing and gives the mixed form', () => {
    const r = convert('length', 350, 'cm', 'm');
    expect(r.value).toBe(3.5);
    expect(r.mixed).toMatchObject({ whole: 3, rest: 50 });
    expect(stepText(r.steps[1]).lt).toBe('10 dm = 1 m. Lipame aukštyn – dalijame: 35 : 10 = 3,5 m.');
    expect(convert('time', 90, 'min', 'h').mixed).toMatchObject({ whole: 1, rest: 30 });
    expect(convert('mass', 3500, 'g', 'kg').value).toBe(3.5);
  });
  it('uses the real step sizes: 1000, 60, 24', () => {
    expect(convert('length', 3, 'km', 'm').steps[0].by).toBe(1000);
    expect(convert('time', 1, 'para', 'min').value).toBe(1440);
    expect(convert('length', 45, 'mm', 'cm').value).toBe(4.5);
    expect(convert('length', 7, 'cm', 'cm').steps).toEqual([]);
  });
  it('writes the chain with a decimal comma in Lithuanian', () => {
    expect(chain('length', 'lt', 1)).toBe('1 m = 10 dm = 100 cm = 1000 mm');
    expect(chain('time', 'lt')).toBe('1 para = 24 h = 1440 min = 86\u00a0400 s');
    expect(stepText(convert('length', 25, 'mm', 'cm').steps[0]).ru).toContain('2,5 cm');
  });
  it('has lt, ru and en for every unit and every step', () => {
    for (const kind of Object.keys(LADDERS) as Kind[]) {
      const L = LADDERS[kind];
      for (const x of L) for (const l of ['lt', 'ru', 'en'] as const) expect(x.name[l] && x.sym[l]).toBeTruthy();
      const t = stepText(convert(kind, 1, L[0].id, L[L.length - 1].id).steps[0]);
      expect(t.ru).not.toMatch(/[ąčęėįšųūž]/);
    }
  });
  it('reads the input as the exercise book writes it', () => {
    expect(parse('2,5')).toBe(2.5);
    expect(parse('1 500')).toBe(1500);
    expect(parse('0')).toBeNull();
    expect(parse('-3')).toBeNull();
    expect(parse('abc')).toBeNull();
  });
});
