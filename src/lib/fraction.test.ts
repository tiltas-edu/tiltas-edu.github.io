import { describe, expect, it } from 'vitest';
import { compare, equal, meaning, name, partOf } from './fraction';

describe('fraction strips', () => {
  it('names fractions in every language', () => {
    expect(name('lt', 3, 4)).toBe('trys ketvirtosios');
    expect(name('ru', 3, 4)).toBe('три четвёртых');
    expect(name('en', 3, 4)).toBe('three quarters');
    expect(name('lt', 1, 2)).toBe('viena antroji (pusė)');
    expect(name('ru', 1, 3)).toBe('одна третья');
    expect(name('lt', 10, 10)).toBe('dešimt dešimtųjų = 1');
    expect(name('lt', 5, 8)).toBe('penkios aštuntosios');
  });
  it('finds equal fractions on the wall', () => {
    expect(equal(1, 2)).toEqual([[2, 4], [3, 6], [4, 8], [5, 10]]);
    expect(equal(1, 3)).toEqual([[2, 6], [3, 9]]);
    expect(equal(1, 7)).toEqual([]);
    expect(compare(1, 3, 1, 4)).toBe(1);
    expect(compare(2, 4, 1, 2)).toBe(0);
  });
  it('explains a part of a number', () => {
    expect(partOf(12, 3, 4).lt).toBe('3/4 skaičiaus 12: 12 : 4 = 3 – tai viena dalis. 3 · 3 = 9.');
    expect(partOf(12, 1, 4).ru).toBe('1/4 от 12: 12 : 4 = 3 — это одна часть.');
    expect(partOf(13, 1, 4).ru).toContain('12, 16');
  });
  it('agrees the number with the noun', () => {
    expect(meaning(3, 4).lt).toBe('Juosta padalyta į 4 lygias dalis, imame 3.');
    expect(meaning(3, 10).lt).toContain('10 lygių dalių');
    expect(meaning(3, 5).ru).toContain('5 равных частей');
    expect(meaning(1, 2).ru).toContain('2 равные части');
  });
});
