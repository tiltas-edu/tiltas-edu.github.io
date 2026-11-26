import { describe, expect, it } from 'vitest';
import { count, day, record, weakGroups, type Log } from './progress';

const D1 = new Date(2026, 10, 26, 10).getTime();
const D1b = new Date(2026, 10, 26, 20).getTime();
const D2 = new Date(2026, 10, 27, 9).getTime();

describe('day', () => {
  it('is the local date', () => expect(day(D1)).toBe('2026-11-26'));
});

describe('record', () => {
  it('first check right without help: solved on the first try', () => {
    const l = record(null, { ok: true, value: '5', helped: false, now: D1 });
    expect(l).toMatchObject({ state: 'solved', first: true, mistakes: 0 });
  });

  it('right after a hint: to recheck on another day', () => {
    const l = record(null, { ok: true, value: '5', helped: true, now: D1 });
    expect(l).toMatchObject({ state: 'recheck', first: false, day: '2026-11-26' });
  });

  it('wrong answers: review, last three distinct kept, mistakes counted', () => {
    let l: Log | null = null;
    for (const v of ['1', '2', '1', '3', '4']) l = record(l, { ok: false, value: v, helped: false, now: D1 });
    expect(l).toMatchObject({ state: 'review', mistakes: 5, wrong: ['4', '3', '1'] });
  });

  it('fixed the same day: recheck; fixed again the next day without help: solved', () => {
    let l = record(null, { ok: false, value: '1', helped: false, now: D1 });
    l = record(l, { ok: true, value: '5', helped: false, now: D1b });
    expect(l.state).toBe('recheck');
    l = record(l, { ok: true, value: '5', helped: true, now: D2 });
    expect(l.state).toBe('recheck');
    l = record(l, { ok: true, value: '5', helped: false, now: D2 + 1 });
    expect(l.state).toBe('recheck'); // the helped answer moved the day to D2
    l = record(l, { ok: true, value: '5', helped: false, now: D2 + 86_400_000 });
    expect(l).toMatchObject({ state: 'solved', mistakes: 1, first: false });
  });

  it('wrong yesterday, right today without help: solved', () => {
    const l = record(record(null, { ok: false, value: '1', helped: false, now: D1 }), { ok: true, value: '5', helped: false, now: D2 });
    expect(l.state).toBe('solved');
  });

  it('a solved task stays solved after a hint, goes back to review after a wrong answer', () => {
    const s = record(null, { ok: true, value: '5', helped: false, now: D1 });
    expect(record(s, { ok: true, value: '5', helped: true, now: D2 }).state).toBe('solved');
    expect(record(s, { ok: false, value: '6', helped: false, now: D2 }).state).toBe('review');
  });
});

describe('count and weakGroups', () => {
  const items = [
    { id: 'a', subject: 'math', group: 'g1' },
    { id: 'b', subject: 'math', group: 'g1' },
    { id: 'c', subject: 'math', group: 'g2' },
    { id: 'd', subject: 'society', group: 'g3' },
  ];
  const logs: Record<string, Log | null> = {
    a: { state: 'solved', wrong: [], mistakes: 0, first: true, day: '', at: 1 },
    b: { state: 'review', wrong: ['1'], mistakes: 2, first: false, day: '', at: 2 },
    c: { state: 'recheck', wrong: ['9'], mistakes: 3, first: false, day: '', at: 3 },
    d: null,
  };

  it('counts by subject and in all', () => {
    const c = count(items, logs, 'subject');
    expect(c.all).toEqual({ total: 4, solved: 1, recheck: 1, review: 1, mistakes: 5, first: 1 });
    expect(c.society).toEqual({ total: 1, solved: 0, recheck: 0, review: 0, mistakes: 0, first: 0 });
  });

  it('lists groups with mistakes, most first', () => {
    expect(weakGroups(items, logs).map((g) => [g.group, g.mistakes])).toEqual([['g2', 3], ['g1', 2]]);
  });
});
